export declare class PostgresEmbeddedServer {
    private readonly osType;
    private readonly serverPath;
    private readonly serverPackageFile;
    private readonly postgresCommands;
    private readonly dbDir;
    private isStarted;
    constructor();
    start(): boolean;
    stop(): boolean;
    isRunning(): boolean;
    private onExitShutdown;
    private checkInstallation;
}
export declare class DarwinOrLinuxPostgresCommands {
    private readonly serverPackageFile;
    private readonly serverPath;
    private readonly dbDir;
    private readonly port;
    constructor(serverPackageFile: string, serverPath: string, dbDir: string);
    isInstalled(): boolean;
    isDatabaseCreated(): boolean;
    private initdb;
    initdbCommand(): string;
    private pg_ctl;
    private pg_ctlCommand;
    pg_ctlCommandStart(): string;
    pg_ctlCommandStop(): string;
    private postgres;
}
