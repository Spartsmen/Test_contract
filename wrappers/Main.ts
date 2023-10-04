import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';
import { Opcodes } from '../helpers/Opcodes';

export type MainConfig = {
    owner_address: Address;
};

export function mainConfigToCell(config: MainConfig): Cell {
    return beginCell()
        .storeAddress(config.owner_address)
    .endCell();
}

export class Main implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Main(address);
    }

    static createFromConfig(config: MainConfig, code: Cell, workchain = 0) {
        const data = mainConfigToCell(config);
        const init = { code, data };
        return new Main(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
        
    }
    async sendWithdraw(provider: ContractProvider, via: Sender, 
        opts: {
            value: bigint,
            amount: bigint
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.withdrawFunds, 32)
                .storeCoins(opts.amount)
            .endCell(),
        });
    }
    async getBalance(provider: ContractProvider) : Promise<bigint> {
        const result = await provider.get('get_smc_balance', []);
        return result.stack.readBigNumber();
    }
}
