import React, { Component } from 'react';
import styled from 'styled-components';
import Context from './Context';
import { FaAngleDown, FaAngleLeft } from 'react-icons/fa';
import { BigNumber } from 'ethers';
import QuestionTooltip from './../components/shared/tooltip';
import { NETWORKS, TOKENSELECTED } from './App';

const Container = styled.div`
  margin-bottom: 20px;
  border-radius: 25px;
  border: 2px solid #73ad21;
  background: white;
`;

const Items = styled.div`
  margin: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RowHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const RowCol = styled.div`
  display: flex;
  flex-direction: column;
`;

const Column = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 15px;
  width: 40%;
`;

const ColumnResult = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 15px;
  flex-flow: column-reverse;
`;

const ColumnDropdown = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 15px;
  padding: 10px 0 15px 0;
`;

const ColumnSecond = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: left;
  font-size: 15px;
`;

const ColumnThird = styled.div`
  display: flex;
  flex-direction: row;
  width: 20%;
  justify-content: left;
  font-size: 15px;
`;

const ColumnRight = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  align-items: end;
  color: rgb(31, 199, 212);
  font-weight: 500;
  font-size: 16px;
`;
const ColumnTextOnly = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  color: blueviolet;
`;

const ColumnGreen = styled.div`
  display: flex;
  flex-direction: row;
  flex-basis: 100%;
  color: rgb(31, 199, 212);
  font-weight: 500;
  justify-content: left;
  align-items: center;
`;

const ColumnRed = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  color: red;
  justify-content: left;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Image = styled.img`
  width: 32px;
  height: 32px;
`;

export interface ProcessEnv {
  [key: string]: string | undefined;
}

const ButtonMaxContainer = styled.div`
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: end;
  top: 135px;
  right: 35px;
`;

const ButtonMax = styled.button`
  /* Adapt the colors based on primary prop */
  background: ${(props: any) => (props.primary ? 'palevioletred' : 'white')};
  color: ${(props: any) => (props.primary ? 'white' : 'palevioletred')};
  z-index: 1;
  font-size: 0.7em;
  padding: 0.1em 1em;
  border: 2px solid palevioletred;
  border-radius: 10px;
`;

interface IProps {
  switchForms(): void;
  t: any;
}

interface IState {
  calcStandard: number;
  inputAmount: any;
  outputAmount: any;
  inputAmountInWei: BigNumber;
  outputAmountInWei: BigNumber;
  loading: boolean;
  minimumReceived: number;
  switched: boolean;
  valTokenA: any;
  valTokenB: any;
  liquidityFee: any;
}

enum Token {
  tokenA = 'tokenA',
  tokenB = 'tokenB',
}

class SwapTokens extends Component<IProps, IState> {
  static contextType = Context;
  private inputAmountRef = React.createRef<HTMLInputElement>();
  private outputAmountRef = React.createRef<HTMLInputElement>();
  constructor(props: IProps) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.setMax = this.setMax.bind(this);

    this.state = {
      calcStandard: 0,
      inputAmount: '',
      outputAmount: '',
      inputAmountInWei: BigNumber.from(0),
      outputAmountInWei: BigNumber.from(0),
      loading: false,
      minimumReceived: 0,
      switched: false,
      valTokenA: '',
      valTokenB: '',
      liquidityFee: 0,
    };
  }

  resetFormFields = async () => {
    this.inputAmountRef.current.value = null;
    this.outputAmountRef.current.value = null;
    this.setState({
      calcStandard: 0,
      minimumReceived: 0,
      inputAmount: null,
      outputAmount: null,
      inputAmountInWei: null,
      outputAmountInWei: null,
      liquidityFee: 0,
    });
  };

  setMax = async (ev: any) => {
    ev.preventDefault();

    if (
      this.context.tokenAData.name === TOKENSELECTED.BLUEBERRY ||
      this.context.tokenBData === TOKENSELECTED.BLUEBERRY
    ) {
      if (
        this.context.tokenAData &&
        Object.keys(this.context.tokenAData).length !== 0 &&
        Object.keys(this.context.signer).length > 0
      ) {
        const maxAllowedTxAmount = await this.context.getInvestorShare(false);

        const pairCalcAddress = await this.context.computePairAddress(
          this.context.factory.address,
          this.context.tokenAData,
          this.context.tokenBData
        );

        let pairInvertedCalcAddress: any;

        pairInvertedCalcAddress = await this.context.computePairAddressNoSort(
          this.context.factory.address,
          this.context.tokenAData,
          this.context.tokenBData
        );

        if (pairCalcAddress !== pairInvertedCalcAddress) {
          let tokenABalance = this.context.tokenABalance;

          let tokenABalanceInWei = await this.context.toWei(
            tokenABalance,
            this.context.tokenAData.decimals
          );

          const res = await this.context.getTokenBAmount(tokenABalanceInWei);
          let output = this.context.fromWei(
            res,
            this.context.tokenBData.decimals
          );

          if (
            Number.parseFloat(maxAllowedTxAmount) < Number.parseFloat(output)
          ) {
            output = maxAllowedTxAmount;
          }

          const tokenABalanceMinusFees = (output * 970) / 1000;

          output = await this.context.replaceDigitsWithZeros(
            tokenABalanceMinusFees.toString()
          );
          this.outputAmountRef.current.value = output;

          await this.handleTokenChanges(false);
        } else {
          let tokenABalance = this.context.tokenABalance;

          let output: any;
          if (
            Number.parseFloat(maxAllowedTxAmount) <
            Number.parseFloat(tokenABalance)
          ) {
            output = Number.parseFloat(maxAllowedTxAmount);
          } else {
            output = Number.parseFloat(tokenABalance);
          }

          const tokenABalanceMinusFees = (output * 970) / 1000;

          output = await this.context.replaceDigitsWithZeros(
            tokenABalanceMinusFees.toString()
          );

          this.inputAmountRef.current.value = output.toString();

          await this.handleTokenChanges(true);
        }
      }
    } else {
      let tokenABalance = this.context.tokenABalance;
      this.inputAmountRef.current.value = tokenABalance.toString();
      await this.handleTokenChanges(true);
    }
  };

  isNumeric(n: any) {
    return !isNaN(parseFloat(n));
  }

  countDecimals = async (value: any) => {
    value = Number.parseFloat(value).toFixed(18);
    const valueToSplit = value.split('.');
    return {
      first: valueToSplit[0].length,
      second: valueToSplit[1].length,
    };
  };

  scientificNumToNumber = async (value: any) => {
    if (value.indexOf('.') !== -1) {
      const countDec = await this.countDecimals(value);
      const beforeDotLen = countDec.first;
      const afterDotLen = countDec.second;
      if (beforeDotLen > 1) {
        return Number.parseFloat(value).toFixed(2);
      } else if (beforeDotLen > 1 && afterDotLen <= 12) {
        return Number.parseFloat(value).toFixed(afterDotLen);
      } else {
        return Number.parseFloat(value).toFixed(13);
      }
    }
    return value;
  };

  handleSubmit = async (event: any) => {
    console.log('submit..');
    event.preventDefault();
    this.setState({ loading: true });

    try {
      if (this.state.inputAmountInWei && this.state.outputAmountInWei) {
        await this.context.swapTokens(
          this.state.inputAmountInWei,
          this.state.outputAmountInWei
        );
        this.setState({ loading: false });
      }
    } catch (e: any) {
      console.log(`SwapTokens:handleSubmit ${e.error}`);
      console.log(e);
      this.setState({
        loading: false,
      });
    }
  };

  setInputOutputValAfterSwitch = async () => {
    console.log('setInputOutputValAfterSwitch..');
    let minimumReceived: any;
    let liquidityFee: any;
    let inputAmount: any, outputAmount: any;
    inputAmount = this.state.inputAmount;
    outputAmount = this.state.outputAmount;

    const tmp = this.outputAmountRef.current.value;
    this.outputAmountRef.current.value = this.inputAmountRef.current.value;
    this.inputAmountRef.current.value = tmp;

    if (this.state.switched) {
      minimumReceived = (outputAmount * (100 - this.context.slippage)) / 100;

      if (this.context.networkName === NETWORKS.BSC_NAME) {
        minimumReceived = (outputAmount * (100 - 1)) / 100;
        liquidityFee = inputAmount / 100;
      } else {
        minimumReceived = (outputAmount * (100 - 0.3)) / 100;
        liquidityFee = (inputAmount * 0.3) / 100;
      }

      liquidityFee = await this.scientificNumToNumber(liquidityFee.toString());

      minimumReceived = await this.scientificNumToNumber(
        minimumReceived.toString()
      );
    } else {
      minimumReceived = (inputAmount * (100 - this.context.slippage)) / 100;
      if (this.context.networkName === NETWORKS.BSC_NAME) {
        minimumReceived = (inputAmount * (100 - 1)) / 100;
        liquidityFee = outputAmount / 100;
      } else {
        minimumReceived = (inputAmount * (100 - 0.3)) / 100;
        liquidityFee = (outputAmount * 0.3) / 100;
      }
      liquidityFee = await this.scientificNumToNumber(liquidityFee.toString());

      minimumReceived = await this.scientificNumToNumber(
        minimumReceived.toString()
      );
    }

    this.setState({
      calcStandard: 0,
      minimumReceived,
      switched: !this.state.switched,
      inputAmountInWei: this.state.outputAmountInWei,
      outputAmountInWei: this.state.inputAmountInWei,
      liquidityFee,
    });
  };

  handleTokenChanges = async (isTokenA: boolean) => {
    let inputAmount: any;
    let outputAmount: any;
    let calcStandard: any;
    let minimumReceived: any;
    let liquidityFee: any;
    let exchangePrice: any;
    let inputAmountInWei: BigNumber = BigNumber.from(0);
    let outputAmountInWei: BigNumber = BigNumber.from(0);

    const inputWithoutSpace = isTokenA
      ? this.inputAmountRef.current?.value.replace(/\s+/g, '')
      : this.outputAmountRef.current?.value.replace(/\s+/g, '');

    if (isTokenA) {
      this.inputAmountRef.current.value = inputWithoutSpace.replace(/,/g, '.');
    } else {
      this.outputAmountRef.current.value = inputWithoutSpace.replace(/,/g, '.');
    }
    const tokenID = isTokenA
      ? this.inputAmountRef.current.id
      : this.outputAmountRef.current.id;

    if (inputWithoutSpace !== '' && this.isNumeric(inputWithoutSpace)) {
      inputAmount = inputWithoutSpace;
      /**
       * ###########################################
       * !Switched && tokenA - Switched && tokenA
       *  ###########################################
       */

      if (
        !this.state.switched &&
        tokenID === Token.tokenA &&
        this.context.tokenAData
      ) {
        console.log('------------------');
        console.log(this.state.switched, tokenID);
        console.log('-------------------');
        try {
          inputAmountInWei = this.context.toWei(
            inputAmount,
            this.context.tokenAData.decimals
          );
          inputAmount = this.context.fromWei(
            inputAmountInWei,
            this.context.tokenAData.decimals
          );

          if (BigNumber.from(inputAmountInWei).gt(0)) {
            outputAmountInWei = await this.context.getTokenBAmount(
              inputAmountInWei
            );

            if (outputAmountInWei) {
              outputAmount = this.context.fromWei(
                outputAmountInWei,
                this.context.tokenBData.decimals
              );

              outputAmount = await this.context.replaceDigitsWithZeros(
                outputAmount
              );

              await this.context.getPriceImpactAToken(inputAmountInWei);

              exchangePrice = await this.context.getTokenAAmount(
                this.context.toWei(1, this.context.tokenBData.decimals)
              );

              if (exchangePrice) {
                calcStandard = await this.context.fromWei(
                  exchangePrice,
                  this.context.tokenAData.decimals
                );
                calcStandard = await this.scientificNumToNumber(
                  calcStandard.toString()
                );
              }

              minimumReceived =
                (outputAmount * (100 - this.context.slippage)) / 100;

              if (this.context.networkName === NETWORKS.BSC_NAME) {
                minimumReceived = (outputAmount * (100 - 1)) / 100;
                liquidityFee = inputAmount / 100;
              } else {
                minimumReceived = (outputAmount * (100 - 0.3)) / 100;
                liquidityFee = (inputAmount * 0.3) / 100;
              }

              liquidityFee = await this.scientificNumToNumber(
                liquidityFee.toString()
              );

              minimumReceived = await this.scientificNumToNumber(
                minimumReceived.toString()
              );

              outputAmountInWei = this.context.toWei(
                outputAmount,
                this.context.tokenBData.decimals
              );
              this.outputAmountRef.current.value = outputAmount;
              await this.context.getLiquidityOwner(this.context.tokenAData);

              this.setState({
                calcStandard,
                minimumReceived,
                inputAmount,
                outputAmount,
                inputAmountInWei,
                outputAmountInWei,
                liquidityFee,
              });
            } else {
              this.setState({
                inputAmount,
                inputAmountInWei,
              });
            }
          }
        } catch (e: any) {
          console.log(e);
        }
      } else if (
        this.state.switched &&
        tokenID === Token.tokenA &&
        this.context.tokenAData
      ) {
        console.log('------------------');
        console.log(this.state.switched, tokenID);
        console.log('-------------------');
        try {
          inputAmountInWei = this.context.toWei(
            inputAmount,
            this.context.tokenAData.decimals
          );
          inputAmount = this.context.fromWei(
            inputAmountInWei,
            this.context.tokenAData.decimals
          );

          if (BigNumber.from(inputAmountInWei).gt(0)) {
            outputAmountInWei = await this.context.getTokenBAmount(
              inputAmountInWei
            );

            if (outputAmountInWei) {
              outputAmount = this.context.fromWei(
                outputAmountInWei,
                this.context.tokenBData.decimals
              );

              outputAmount = await this.context.replaceDigitsWithZeros(
                outputAmount
              );

              await this.context.getPriceImpactBToken(inputAmountInWei);

              exchangePrice = await this.context.getTokenAAmount(
                this.context.toWei(1, this.context.tokenBData.decimals)
              );

              if (exchangePrice) {
                calcStandard = await this.context.fromWei(
                  exchangePrice,
                  this.context.tokenAData.decimals
                );
                calcStandard = await this.scientificNumToNumber(
                  calcStandard.toString()
                );
              }

              minimumReceived = minimumReceived =
                (outputAmount * (100 - this.context.slippage)) / 100;

              if (this.context.networkName === NETWORKS.BSC_NAME) {
                minimumReceived = (outputAmount * (100 - 1)) / 100;
                liquidityFee = inputAmount / 100;
              } else {
                minimumReceived = (outputAmount * (100 - 0.3)) / 100;
                liquidityFee = (inputAmount * 0.3) / 100;
              }

              liquidityFee = await this.scientificNumToNumber(
                liquidityFee.toString()
              );

              minimumReceived = await this.scientificNumToNumber(
                minimumReceived.toString()
              );

              outputAmountInWei = this.context.toWei(
                outputAmount,
                this.context.tokenBData.decimals
              );
              this.outputAmountRef.current.value = outputAmount;
              await this.context.getLiquidityOwner(this.context.tokenAData);

              this.setState({
                calcStandard,
                minimumReceived,
                inputAmount,
                outputAmount,
                inputAmountInWei,
                outputAmountInWei,
                liquidityFee,
              });
            } else {
              this.setState({
                inputAmount,
                inputAmountInWei,
              });
            }
          }
        } catch (e: any) {
          console.log(e);
        }
        /**
         * ###########################################
         *  !Switched && tokenB - Switched && tokenB
         *  ###########################################
         */
      } else if (
        !this.state.switched &&
        tokenID === Token.tokenB &&
        this.context.tokenBData
      ) {
        console.log('------------------');
        console.log(this.state.switched, tokenID);
        console.log('-------------------');

        outputAmountInWei = this.context.toWei(
          inputAmount,
          this.context.tokenBData.decimals
        );
        outputAmount = this.context.fromWei(
          outputAmountInWei,
          this.context.tokenBData.decimals
        );

        try {
          if (BigNumber.from(outputAmountInWei).gt(0)) {
            inputAmountInWei = await this.context.getTokenAAmount(
              outputAmountInWei
            );

            if (inputAmountInWei) {
              inputAmount = this.context.fromWei(
                inputAmountInWei,
                this.context.tokenAData.decimals
              );

              inputAmount = await this.context.replaceDigitsWithZeros(
                inputAmount
              );

              await this.context.getPriceImpactAToken(inputAmountInWei);

              exchangePrice = await this.context.getTokenAAmount(
                this.context.toWei(1, this.context.tokenBData.decimals)
              );

              if (exchangePrice) {
                calcStandard = await this.context.fromWei(
                  exchangePrice,
                  this.context.tokenAData.decimals
                );
                calcStandard = await this.scientificNumToNumber(
                  calcStandard.toString()
                );
              }

              minimumReceived =
                (outputAmount * (100 - this.context.slippage)) / 100;

              if (this.context.networkName === NETWORKS.BSC_NAME) {
                minimumReceived = (outputAmount * (100 - 1)) / 100;
                liquidityFee = inputAmount / 100;
              } else {
                minimumReceived = (outputAmount * (100 - 0.3)) / 100;
                liquidityFee = (inputAmount * 0.3) / 100;
              }

              liquidityFee = await this.scientificNumToNumber(
                liquidityFee.toString()
              );

              minimumReceived = await this.scientificNumToNumber(
                minimumReceived.toString()
              );

              inputAmountInWei = this.context.toWei(
                inputAmount,
                this.context.tokenAData.decimals
              );
              this.inputAmountRef.current.value = inputAmount;
              this.context.getLiquidityOwner(this.context.tokenBData);

              this.setState({
                calcStandard,
                minimumReceived,
                inputAmount,
                outputAmount,
                inputAmountInWei,
                outputAmountInWei,
                liquidityFee,
              });
            } else {
              this.setState({
                outputAmount,
                outputAmountInWei,
              });
            }
          }
        } catch (e: any) {
          console.log(e.data.message);
        }
      } else if (
        this.state.switched &&
        tokenID === Token.tokenB &&
        this.context.tokenBData
      ) {
        console.log('------------------');
        console.log(this.state.switched, tokenID);
        console.log('-------------------');
        try {
          outputAmountInWei = this.context.toWei(
            inputWithoutSpace,
            this.context.tokenBData.decimals
          );
          outputAmount = this.context.fromWei(
            outputAmountInWei,
            this.context.tokenBData.decimals
          );

          if (BigNumber.from(outputAmountInWei).gt(0)) {
            inputAmountInWei = await this.context.getTokenAAmount(
              outputAmountInWei
            );

            if (inputAmountInWei) {
              inputAmount = this.context.fromWei(
                inputAmountInWei,
                this.context.tokenAData.decimals
              );

              inputAmount = await this.context.replaceDigitsWithZeros(
                inputAmount
              );

              await this.context.getPriceImpactBToken(inputAmountInWei);

              exchangePrice = await this.context.getTokenAAmount(
                this.context.toWei(1, this.context.tokenBData.decimals)
              );

              if (exchangePrice) {
                calcStandard = await this.context.fromWei(
                  exchangePrice,
                  this.context.tokenAData.decimals
                );
                calcStandard = await this.scientificNumToNumber(
                  calcStandard.toString()
                );
              }

              minimumReceived =
                (outputAmount * (100 - this.context.slippage)) / 100;

              if (this.context.networkName === NETWORKS.BSC_NAME) {
                minimumReceived = (outputAmount * (100 - 1)) / 100;
                liquidityFee = inputAmount / 100;
              } else {
                minimumReceived = (outputAmount * (100 - 0.3)) / 100;
                liquidityFee = (inputAmount * 0.3) / 100;
              }

              liquidityFee = await this.scientificNumToNumber(
                liquidityFee.toString()
              );

              minimumReceived = await this.scientificNumToNumber(
                minimumReceived.toString()
              );

              inputAmountInWei = this.context.toWei(
                inputAmount,
                this.context.tokenAData.decimals
              );
              this.inputAmountRef.current.value = inputAmount;
              await this.context.getLiquidityOwner(this.context.tokenAData);

              this.setState({
                calcStandard,
                minimumReceived,
                inputAmount,
                outputAmount,
                inputAmountInWei,
                outputAmountInWei,
                liquidityFee,
              });
            } else {
              this.setState({
                inputAmount,
                inputAmountInWei,
              });
            }
          }
        } catch (e: any) {
          console.log(e);
        }
      }
    } else {
      await this.resetFormFields();
      await this.context.clearStates();
    }
  };

  toggleModal = (tokenBSelected: boolean) => {
    this.context.toggleTokenListModal(tokenBSelected);
  };

  clickSwitchForm = async (e: any) => {
    this.props.switchForms();
    await this.setInputOutputValAfterSwitch();
  };

  main = () => (
    <div id="content">
      <div className="card mb-4">
        <div className="card-body">
          <form
            autoComplete="off"
            className="mb-3"
            onSubmit={(event: any) => {
              event.preventDefault();
              this.handleSubmit(event);
            }}
          >
            <RowHeader>
              <RowCol>
                <ColumnResult>
                  <label className="float-left">
                    <b>{this.props.t('input')}</b>
                  </label>
                </ColumnResult>
                <ColumnDropdown>
                  <div
                    className="input-group-append"
                    onClick={() => this.toggleModal(false)}
                  >
                    {this.context.tokenAData?.symbol ? (
                      <div>
                        <Image src={this.context.tokenAData.logoURI}></Image>
                        &nbsp; {this.context.tokenAData.symbol} <FaAngleDown />
                      </div>
                    ) : (
                      <div className="input-group-text">
                        {this.props.t('select')}
                        <FaAngleDown />
                      </div>
                    )}
                  </div>
                </ColumnDropdown>
              </RowCol>
              <ColumnResult>
                <span className="float-right text-muted">
                  {this.props.t('balance')}
                  <p>{this.context.tokenABalance}</p>
                </span>
              </ColumnResult>
            </RowHeader>
            <div>
              <input
                id="tokenA"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="0.0"
                ref={this.inputAmountRef}
                onChange={() => this.handleTokenChanges(true)}
                className="form-control form-control-lg"
                required
              />
              <ButtonMaxContainer>
                <ButtonMax onClick={this.setMax}>
                  {this.props.t('max')}
                </ButtonMax>
                <QuestionTooltip
                  title="0.5% max tx from totalsupply. 
              Only valid for Blueberry token."
                />
              </ButtonMaxContainer>
            </div>

            <div
              className="d-flex justify-content-center  m-3"
              onClick={this.clickSwitchForm}
            >
              <i className="fa fa-chevron-down"></i>
            </div>
            <RowHeader>
              <RowCol>
                <Column>
                  <label className="float-left">
                    <b>{this.props.t('output')}</b>
                  </label>
                </Column>
                <ColumnDropdown>
                  <div
                    className="input-group-append"
                    onClick={() => this.toggleModal(true)}
                  >
                    {this.context.tokenBData?.symbol ? (
                      <div>
                        <Image src={this.context.tokenBData.logoURI}></Image>
                        &nbsp; {this.context.tokenBData.symbol} <FaAngleDown />
                      </div>
                    ) : (
                      <div className="input-group-text">
                        Select
                        <FaAngleDown />
                      </div>
                    )}
                  </div>
                </ColumnDropdown>
              </RowCol>
              <ColumnResult>
                <span className="float-right text-muted">
                  {this.props.t('balance')}
                  <p>{this.context.tokenBBalance}</p>
                </span>
              </ColumnResult>
            </RowHeader>
            <div className="input-group mb-2">
              <input
                id="tokenB"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="0.0"
                ref={this.outputAmountRef}
                onChange={() => this.handleTokenChanges(false)}
                className="form-control form-control-lg"
                required
              />
            </div>
            <div className="mb-5">
              <Row>
                <ColumnTextOnly>
                  {this.props.t('slippageTolerance')}
                </ColumnTextOnly>
                <ColumnRight>{this.context.slippage} %</ColumnRight>
              </Row>

              {this.state.calcStandard > 0 ? (
                <>
                  <span className="float-left text-muted">Price</span>
                  <br />
                  <span
                    className="float-right text-muted"
                    style={{ width: '100%', padding: 5 }}
                  >
                    <i style={{ margin: '3px' }}>1</i>
                    {this.context.tokenBData?.symbol} =
                    <i style={{ margin: '3px' }}>{this.state?.calcStandard}</i>
                    {this.context.tokenAData?.symbol}
                  </span>
                </>
              ) : null}
            </div>
            {this.context.correctNetwork && this.context.account ? (
              !this.state.loading ? (
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                >
                  {this.props.t('swap')}
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled
                >
                  <div className="spinner-border" role="status">
                    <span className="sr-only">{this.props.t('loading')}</span>
                  </div>
                </button>
              )
            ) : (
              <button
                type="button"
                className="btn  btn-block btn-lg"
                style={{
                  backgroundColor: '#FF9900',
                  boxShadow: 'rgb(14 14 44 / 40%) 0px -1px 0px 0px inset',
                }}
                onClick={this.context.connectToWeb3}
              >
                {this.props.t('connect')}
              </button>
            )}
          </form>
        </div>
      </div>
      {this.context.priceImpact > 0 ? (
        <Container>
          <Items>
            <ColumnContainer>
              <Row>
                <Column>{this.props.t('minimumReceived')}</Column>
                <ColumnSecond>
                  <QuestionTooltip
                    title={this.props.t('minimumReceivedTooltip')}
                  />
                </ColumnSecond>
                <ColumnThird>
                  {this.state.outputAmountInWei
                    ? this.state.minimumReceived
                    : '0'}
                </ColumnThird>
              </Row>
            </ColumnContainer>
            <ColumnContainer>
              <Row>
                <Column>{this.props.t('priceImpact')}</Column>
                <ColumnSecond>
                  <QuestionTooltip title={this.props.t('priceImpactTooltip')} />
                </ColumnSecond>
                <ColumnThird>
                  {this.context.priceImpact > 3 ? (
                    <ColumnRed>{this.context.priceImpact} %</ColumnRed>
                  ) : this.context.priceImpact === '0.01' ? (
                    <ColumnGreen>
                      <FaAngleLeft />
                      {this.context.priceImpact}%
                    </ColumnGreen>
                  ) : (
                    <ColumnGreen>{this.context.priceImpact}%</ColumnGreen>
                  )}
                </ColumnThird>
              </Row>
            </ColumnContainer>
            <ColumnContainer>
              <Row>
                <Column>{this.props.t('liquidityProviderFee')}</Column>
                <ColumnSecond>
                  <QuestionTooltip
                    title={this.props.t('liquidityProviderFeeTooltip')}
                  />
                </ColumnSecond>
                <ColumnThird>
                  {this.state.outputAmountInWei ? this.state.liquidityFee : '0'}
                </ColumnThird>
              </Row>
            </ColumnContainer>
          </Items>
        </Container>
      ) : null}
    </div>
  );
  render() {
    return this.main();
  }
}
export default SwapTokens;
