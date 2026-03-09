import { Injectable } from '@nestjs/common';
import { XlsxImportSpreadsheetAdapter } from './xlsx-import-spreadsheet.adapter';
import { InternalConfigAppError } from '../../shared/exceptions/custom/internal-config.error';
import { ERROR_MESSAGES } from '../../shared/exceptions/error-messages.enum';
import { ImportSpreadsheetPort } from '../contracts/import-spreadsheet.port';

@Injectable()
export class ImportSpreadsheetFactory {

  public getImporter(file: Express.Multer.File): ImportSpreadsheetPort {
    const originalName = file.originalname || '';

    const extension = originalName
      .slice(originalName.lastIndexOf('.'))
      .toLowerCase();

    if (extension === 'xlsx') {
      return new XlsxImportSpreadsheetAdapter(file);
    }

    throw new InternalConfigAppError(ERROR_MESSAGES.SPREADSHEET_EXTENSION_NOT_SUPPORTED)
  }

}