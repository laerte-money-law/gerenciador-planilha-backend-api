export class ImportSpreadsheetDto {
  file: Express.Multer.File;
  teamId: number;
  clientId: number;
  service: string
}
