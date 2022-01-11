import fs from "fs";
import path from "path";
import RootPath from "app-root-path"
import {exec, execSync} from "child_process";
import * as os from "os";
import {randomInt} from "crypto";

const version = "10.6-1"

function printHeader() {
    console.log(`Embedded Postgresql ${version}`)
}

export class PostgresEmbeddedServer {
    private readonly osType = process.platform
    private readonly serverPath: string
    private readonly serverPackageFile: string
    private readonly postgresCommands: DarwinOrLinuxPostgresCommands
    private readonly dbDir: string
    private isStarted: boolean

    constructor() {
        this.onExitShutdown.bind(this)
        this.dbDir = path.join(os.tmpdir(), `postgres_embedded_${version}_${randomInt(1000000, 9999999)}`)
        this.serverPath = path.join(RootPath.path, "servers", process.platform, version)
        let theOsType: string = this.osType
        if (theOsType == "win32") {
            theOsType = "windows"
        }
        this.serverPackageFile = path.join(RootPath.path, "scripts", "target", `postgresql-${version}-${theOsType}-x86_64.txz`)
        this.isStarted = false

        switch (this.osType) {
            case "darwin":
            case "linux":
                this.postgresCommands = new DarwinOrLinuxPostgresCommands(
                    this.serverPackageFile,
                    this.serverPath,
                    this.dbDir
                )
                break
            default:
                throw Error(`Operating system ${this.osType} not supported.`)
        }

    }

    start(): boolean {
        try {
            printHeader()
            console.log(`   * running at ${this.serverPath}`)
            if (this.isStarted) {
                console.log(`   * already started`)
                return true
            }
            console.log(`   * starting`)
            this.checkInstallation()
            const child = exec(this.postgresCommands.pg_ctlCommandStart(), (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
            console.log(`   * started`)
            this.isStarted = true
            this.onExitShutdown()
            return true
        } catch (err: any) {
            console.log(err.message)
            throw err
        }
    }

    stop(): boolean {
        try {
            printHeader()
            console.log(`   * running at ${this.serverPath}`)
            if (!this.isStarted) {
                return true
            }
            console.log(`   * stopping`)
            this.checkInstallation()
            const child = execSync(this.postgresCommands.pg_ctlCommandStop())
            console.log(String(child))
            console.log(`   * stopped`)
            this.isStarted = false
            return true
        } catch (err: any) {
            console.log(err.mesage)
            throw err
        }
    }

    isRunning(): boolean {
        return this.isStarted
    }

    private onExitShutdown() {
        if (this.isStarted) {
            process.on("exit", () => this.stop())

            //     process
            //         .on('SIGHUP', () => {
            //             this.stop()
            //         })
            //         .on('exit', () => {
            //             process.kill(process.pid, 'SIGTERM');
            //         });
        }
    }

    private checkInstallation() {
        if (!this.postgresCommands.isInstalled()) {
            fs.mkdirSync(this.serverPath, {recursive: true})
            const child = execSync(`cd ${this.serverPath} && tar xJf ${this.serverPackageFile}`)
            console.log(String(child))
        }
        if (!this.postgresCommands.isDatabaseCreated()) {
            fs.mkdirSync(this.dbDir, {recursive: true})
            const child = execSync(this.postgresCommands.initdbCommand(), {shell: "/bin/bash"})
            console.log(String(child))
        }
    }

}

export class DarwinOrLinuxPostgresCommands {
    private readonly serverPackageFile: string
    private readonly serverPath: string
    private readonly dbDir: string
    private readonly port = 15432

    constructor(serverPackageFile: string, serverPath: string, dbDir: string) {
        this.serverPackageFile = serverPackageFile
        this.serverPath = serverPath
        this.dbDir = dbDir
    }

    isInstalled(): boolean {
        return fs.existsSync(this.initdb())
    }

    isDatabaseCreated(): boolean {
        return fs.existsSync(this.dbDir)
    }

    private initdb(): string {
        return path.join(this.serverPath, "bin", "initdb")
    }

    initdbCommand(): string {
        // return `PGPASSWORD=postgres ${this.initdb()} --username=postgres --pgdata=directory=${this.dbDir}`
        return `${this.initdb()} --username=postgres --pgdata=${this.dbDir} -A md5 --pwfile=<(echo postgres)`
    }

    private pg_ctl(): string {
        return path.join(this.serverPath, "bin", "pg_ctl")
    }

    private pg_ctlCommand(subCommand: string): string {
        return `${this.pg_ctl()} -D ${this.dbDir} -o "-p${this.port}" ${subCommand}`
    }

    pg_ctlCommandStart(): string {
        return this.pg_ctlCommand("start")
    }

    pg_ctlCommandStop(): string {
        return this.pg_ctlCommand("stop")
    }

    private postgres(): string {
        return path.join(this.serverPath, "bin", "postgres")
    }
}

