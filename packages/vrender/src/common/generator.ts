export class Generator {
  private static auto_increment_id: number = 0;

  static GenAutoIncrementId(): number {
    return Generator.auto_increment_id++;
  }
}
