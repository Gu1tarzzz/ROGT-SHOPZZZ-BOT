import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
export class JsonStore {
    filename;
    defaultValue;
    constructor(filename, defaultValue) {
        this.filename = filename;
        this.defaultValue = defaultValue;
    }
    get path() {
        return path.join(process.cwd(), "database", this.filename);
    }
    async read() {
        try {
            const raw = await readFile(this.path, "utf8");
            return JSON.parse(raw);
        }
        catch (error) {
            if (error.code !== "ENOENT")
                throw error;
            await this.write(this.defaultValue);
            return structuredClone(this.defaultValue);
        }
    }
    async write(value) {
        await mkdir(path.dirname(this.path), { recursive: true });
        const temporaryPath = `${this.path}.tmp`;
        await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
        await rename(temporaryPath, this.path);
    }
    async update(mutator) {
        const next = await mutator(await this.read());
        await this.write(next);
        return next;
    }
}
