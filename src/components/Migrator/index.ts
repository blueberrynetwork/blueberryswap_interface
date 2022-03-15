import ERC20 from '../../abi/src/contracts/BlueberryERC20.sol/BlueberryERC20.json';
import MIGRATOROLLERC20 from '../../abi/src/contracts/BlueberryRoll.sol/BlueberryRoll.json';
import { BigNumber, ethers } from 'ethers';
import { Zero } from '@ethersproject/constants';
import { signERC2612Permit } from 'eth-permit';
import { ITokenData } from '../IStates/IApp';

export class Migrator {
  static ttl = 60 * 20;
  //Cake-LP address
  static lpTokenAddress = '0xd7538cABBf8605BdE1f4901B47B8D42c61DE0367';
  // Deployed Sushiroll contract address
  static migratorRollAddress = '0x56e4442b8061319808F1285D266Dc9B912C3eF6B';

  // add 10%
  static calculateGasMargin(value: BigNumber): BigNumber {
    return value
      .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
      .div(BigNumber.from(10000));
  }

  static getLPBalance = async (signer: any, account: any) => {
    const lpToken = new ethers.Contract(this.lpTokenAddress, ERC20.abi, signer);
    const lpTokenBalance = await lpToken.balanceOf(account);
    return lpTokenBalance;
  };
  static migrate = async (
    tokenAData: ITokenData,
    tokenBData: ITokenData,
    account: any,
    signer: any,
    provider: any
  ) => {
    const lpToken = new ethers.Contract(this.lpTokenAddress, ERC20.abi, signer);
    const sushiRoll = new ethers.Contract(
      this.migratorRollAddress,
      MIGRATOROLLERC20.abi,
      signer
    );

    if (!signer || !sushiRoll) throw new Error('missing dependencies');

    const deadline = Math.floor(new Date().getTime() / 1000) + this.ttl;

    const liquidity = await this.getLPBalance(signer, account);

    const permit = await signERC2612Permit(
      provider,
      lpToken.address,
      account,
      this.migratorRollAddress,
      liquidity.toString(),
      deadline
    );

    const args = [
      tokenAData.address,
      tokenBData.address,
      liquidity,
      Zero,
      Zero,
      deadline,
      permit.v,
      permit.r,
      permit.s,
    ];

    try {
      const gasLimit = await sushiRoll.estimateGas.migrateWithPermit(...args, {
        from: account,
      });

      const tx = await sushiRoll.migrateWithPermit(...args, {
        gasLimit: this.calculateGasMargin(gasLimit),
      });
      await tx.wait();
      return tx;
    } catch (e: any) {
      console.log(e);
    }
  };
}
