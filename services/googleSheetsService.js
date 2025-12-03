const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

class GoogleSheetsService {
  constructor() {
    this.doc = null;
    this.sheet = null;
    this.isInitialized = false;
  }

  // Helper function to delay execution
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async initialize() {
    try {
      if (this.isInitialized) return;

      if (!process.env.GOOGLE_SHEET_ID || 
          !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 
          !process.env.GOOGLE_PRIVATE_KEY) {
        console.warn('⚠️ Google Sheets credentials not configured. Skipping sync.');
        return;
      }

      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
      
      console.log('📡 Loading spreadsheet info...');
      await this.doc.loadInfo();
      console.log(`📄 Spreadsheet: ${this.doc.title}`);

      this.sheet = this.doc.sheetsByIndex[0];
      
      if (!this.sheet) {
        console.log('📝 Creating new sheet...');
        this.sheet = await this.doc.addSheet({ 
          title: 'Attendance Records',
          headerValues: [
            'Date',
            'Employee Object ID',
            'Employee ID',
            'First Name',
            'Last Name',
            'IN Time',
            'OUT Time',
            'Working Hours',
            'Status',
            'Created At',
            'Updated At'
          ]
        });
        console.log('✅ New sheet created with headers');
      } else {
        console.log(`📊 Found sheet: ${this.sheet.title}`);
        
        try {
          await this.sheet.loadHeaderRow();
          
          if (this.sheet.headerValues.length === 0) {
            console.log('📝 Setting headers...');
            await this.sheet.setHeaderRow([
              'Date',
              'Employee Object ID',
              'Employee ID',
              'First Name',
              'Last Name',
              'IN Time',
              'OUT Time',
              'Working Hours',
              'Status',
              'Created At',
              'Updated At'
            ]);
            console.log('✅ Headers set successfully');
          } else {
            console.log('✅ Headers already present');
          }
        } catch (headerError) {
          console.log('📝 Sheet is empty, setting headers...');
          await this.sheet.setHeaderRow([
            'Date',
            'Employee Object ID',
            'Employee ID',
            'First Name',
            'Last Name',
            'IN Time',
            'OUT Time',
            'Working Hours',
            'Status',
            'Created At',
            'Updated At'
          ]);
          console.log('✅ Headers set successfully');
        }
      }

      this.isInitialized = true;
      console.log('✅ Google Sheets Service initialized successfully');
      console.log(`📊 Active Sheet: ${this.sheet.title} (${this.sheet.rowCount} rows)`);
    } catch (error) {
      console.error('❌ Google Sheets initialization error:', error.message);
    }
  }

  async addAttendanceRecord(data) {
    try {
      await this.initialize();
      if (!this.isInitialized) {
        return { success: false, error: 'Not initialized' };
      }

      const row = {
        'Date': data.date,
        'Employee Object ID': data.employeeObjectId.toString(),
        'Employee ID': data.employeeId,
        'First Name': data.firstName,
        'Last Name': data.lastName,
        'IN Time': data.inTime ? this.formatDateTime(data.inTime) : '',
        'OUT Time': data.outTime ? this.formatDateTime(data.outTime) : '',
        'Working Hours': data.workingHours?.toFixed(2) || '0.00',
        'Status': data.status || 'IN',
        'Created At': this.formatDateTime(new Date()),
        'Updated At': this.formatDateTime(new Date())
      };

      await this.sheet.addRow(row);
      console.log(`✅ [Google Sheets] Added: ${data.firstName} ${data.lastName} - ${data.date}`);
      return { success: true };
    } catch (error) {
      console.error('❌ [Google Sheets] Error adding record:', error.message);
      return { success: false, error: error.message };
    }
  }

  async updateAttendanceRecord(date, employeeObjectId, updateData) {
    try {
      await this.initialize();
      if (!this.isInitialized) {
        return { success: false, error: 'Not initialized' };
      }

      const rows = await this.sheet.getRows();
      const rowToUpdate = rows.find(row => 
        row.get('Date') === date && 
        row.get('Employee Object ID') === employeeObjectId.toString()
      );

      if (rowToUpdate) {
        if (updateData.firstName !== undefined) rowToUpdate.set('First Name', updateData.firstName);
        if (updateData.lastName !== undefined) rowToUpdate.set('Last Name', updateData.lastName);
        if (updateData.inTime !== undefined) rowToUpdate.set('IN Time', updateData.inTime ? this.formatDateTime(updateData.inTime) : '');
        if (updateData.outTime !== undefined) rowToUpdate.set('OUT Time', updateData.outTime ? this.formatDateTime(updateData.outTime) : '');
        if (updateData.workingHours !== undefined) rowToUpdate.set('Working Hours', updateData.workingHours?.toFixed(2) || '0.00');
        if (updateData.status !== undefined) rowToUpdate.set('Status', updateData.status);
        rowToUpdate.set('Updated At', this.formatDateTime(new Date()));

        await rowToUpdate.save();
        console.log(`✅ [Google Sheets] Updated: ${date} - ${employeeObjectId}`);
        return { success: true };
      } else {
        console.warn(`⚠️ [Google Sheets] Record not found: ${date} - ${employeeObjectId}`);
        return { success: false, error: 'Record not found' };
      }
    } catch (error) {
      console.error('❌ [Google Sheets] Error updating record:', error.message);
      return { success: false, error: error.message };
    }
  }

  async deleteAttendanceRecord(date, employeeObjectId) {
    try {
      await this.initialize();
      if (!this.isInitialized) {
        return { success: false, error: 'Not initialized' };
      }

      const rows = await this.sheet.getRows();
      const rowToDelete = rows.find(row => 
        row.get('Date') === date && 
        row.get('Employee Object ID') === employeeObjectId.toString()
      );

      if (rowToDelete) {
        await rowToDelete.delete();
        console.log(`✅ [Google Sheets] Deleted: ${date} - ${employeeObjectId}`);
        return { success: true };
      } else {
        console.warn(`⚠️ [Google Sheets] Record not found: ${date} - ${employeeObjectId}`);
        return { success: false, error: 'Record not found' };
      }
    } catch (error) {
      console.error('❌ [Google Sheets] Error deleting record:', error.message);
      return { success: false, error: error.message };
    }
  }

  async bulkDeleteAttendanceRecords(recordsToDelete) {
    try {
      await this.initialize();
      if (!this.isInitialized) {
        return { success: false, error: 'Not initialized' };
      }

      const rows = await this.sheet.getRows();
      const deletedRecords = [];
      const errors = [];

      for (const record of recordsToDelete) {
        try {
          const rowToDelete = rows.find(row => 
            row.get('Date') === record.date && 
            row.get('Employee Object ID') === record.employeeObjectId.toString()
          );

          if (rowToDelete) {
            await rowToDelete.delete();
            deletedRecords.push(record);
          } else {
            errors.push(`Record not found: ${record.date} - ${record.employeeObjectId}`);
          }
        } catch (err) {
          errors.push(`Error deleting ${record.date} - ${record.employeeObjectId}: ${err.message}`);
        }
      }

      console.log(`✅ [Google Sheets] Bulk delete: ${deletedRecords.length} records deleted`);
      return { success: true, deletedCount: deletedRecords.length, errors };
    } catch (error) {
      console.error('❌ [Google Sheets] Bulk delete error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 🆕 OPTIMIZED: Batch sync with rate limiting and REVERSE ORDER (oldest first)
  async syncAllRecords(attendanceRecords) {
    try {
      await this.initialize();
      if (!this.isInitialized) {
        return { success: false, error: 'Not initialized' };
      }

      console.log('🔄 [Google Sheets] Clearing existing data...');
      const rows = await this.sheet.getRows();
      for (const row of rows) {
        await row.delete();
      }

      // 🔄 REVERSE the records array (oldest first, newest last)
      const reversedRecords = [...attendanceRecords].reverse();
      
      console.log(`🔄 [Google Sheets] Adding ${reversedRecords.length} records in chronological order (oldest → newest)...`);
      console.log(`📅 Date range: ${reversedRecords[0]?.date} → ${reversedRecords[reversedRecords.length - 1]?.date}`);
      
      let addedCount = 0;
      let errorCount = 0;
      const BATCH_SIZE = 50; // Process 50 records, then pause
      const DELAY_MS = 65000; // Wait 65 seconds between batches

      for (let i = 0; i < reversedRecords.length; i++) {
        const record = reversedRecords[i];
        
        try {
          const result = await this.addAttendanceRecord(record);
          if (result.success) {
            addedCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
          console.error(`❌ Error adding record ${i + 1}:`, err.message);
        }

        // Show progress every 10 records
        if ((i + 1) % 10 === 0) {
          console.log(`   Progress: ${i + 1}/${reversedRecords.length} (${addedCount} success, ${errorCount} errors)`);
        }

        // Pause after every BATCH_SIZE records
        if ((i + 1) % BATCH_SIZE === 0 && i + 1 < reversedRecords.length) {
          console.log(`\n⏸️  Pausing for ${DELAY_MS / 1000} seconds to respect Google API rate limits...`);
          console.log(`   Completed: ${i + 1}/${reversedRecords.length}`);
          console.log(`   Remaining: ${reversedRecords.length - (i + 1)} records`);
          console.log(`   Current date in progress: ${record.date}\n`);
          await this.sleep(DELAY_MS);
          console.log('▶️  Resuming sync...\n');
        }
      }

      console.log(`\n✅ [Google Sheets] Sync complete!`);
      console.log(`   Total records: ${reversedRecords.length}`);
      console.log(`   Successfully synced: ${addedCount}`);
      console.log(`   Errors: ${errorCount}`);
      console.log(`   Order: Oldest (${reversedRecords[0]?.date}) → Newest (${reversedRecords[reversedRecords.length - 1]?.date})`);
      
      return { success: true, count: addedCount, errorCount };
    } catch (error) {
      console.error('❌ [Google Sheets] Sync error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 🇮🇳 Format DateTime in IST (Indian Standard Time - UTC+5:30)
  formatDateTime(date) {
    if (!date) return '';
    
    // Convert input to Date object if it's not already
    const utcDate = new Date(date);
    
    // IST is UTC + 5 hours 30 minutes
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istDate = new Date(utcDate.getTime() + istOffset);
    
    // Format the IST date
    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const hours = String(istDate.getUTCHours()).padStart(2, '0');
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

const googleSheetsService = new GoogleSheetsService();
module.exports = googleSheetsService;