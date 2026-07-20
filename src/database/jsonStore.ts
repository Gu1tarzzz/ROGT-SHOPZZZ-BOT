import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export class JsonStore<T> {
  public constructor(
    private readonly filename: string,
    private readonly defaultValue: T
  ) {}

  private get path(): string {
    return path.join(process.cwd(), "database", this.filename);
  }

  public async read(): Promise<T> {
    try {
      const raw = await readFile(this.path, "utf8");
      return JSON.parse(raw) as T;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await this.write(this.defaultValue);
      return structuredClone(this.defaultValue);
    }
  }

  public async write(value: T): Promise<void> {
    await mkdir(path.dirname(this.path), { recursive: true });
    const temporaryPath = `${this.path}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.path);
  }

  public async update(mutator: (current: T) => T | Promise<T>): Promise<T> {
    const next = await mutator(await this.read());
    await this.write(next);
    return next;
  }
}
