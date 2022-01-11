import {expect} from 'chai';
import {PostgresEmbeddedServer} from "../app/postgres.embedded.server";


// I am not fan of this function, any idea for a replacement will be welcome.
const delay = (function () {
    var timer = 0;
    return function (callback: () => void, ms: number) {
        clearTimeout(timer);
        // @ts-ignore
        timer = setTimeout(callback, ms);
    };
})();

describe("Test Embedded postgres server", function () {
    it('should launch default version of postgresql', function () {
        const postgresEmbeddedServer = new PostgresEmbeddedServer()
        expect(true).to.equal(postgresEmbeddedServer.start())
        expect(true).to.equal(postgresEmbeddedServer.isRunning())
        delay(function () {
            expect(true).to.equal(postgresEmbeddedServer.stop())
        }, 4000); // end delay
    });
});

