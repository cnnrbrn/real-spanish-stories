export class UploadAudioCommand {
  constructor(
    public readonly videoId: number,
    public readonly file: Express.Multer.File,
    public readonly transcriptionOption: string,
    public readonly fixTimestamps: boolean,
  ) {}
}
