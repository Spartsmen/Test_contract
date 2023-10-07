import { Address, toNano } from 'ton-core';
import { Main } from '../wrappers/Main';
import { NetworkProvider, sleep } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Smc address:'));
    const amount = args.length > 1 ? args[1] : await ui.input('Amount to send');

    const main = provider.open(Main.createFromAddress(address));

    const balanceBefore = await main.getBalance();

    await main.sendWithdraw(provider.sender(), {
        amount: toNano('0.01'),
        value: toNano(amount)
    });

    let balanceAfter = await main.getBalance();

    let attempt = 1;
    while (balanceAfter === balanceBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        balanceAfter = await main.getBalance();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Succesfully withdrawed!');
}