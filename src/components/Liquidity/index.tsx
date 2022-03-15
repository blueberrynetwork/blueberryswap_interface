import React, { Component } from 'react';
import styled from 'styled-components';
import Context from '../Context';
import { FaAngleDown } from 'react-icons/fa';
import { BigNumber } from 'ethers';

const Container = styled.div`
  margin-bottom: 20px;
  border-radius: 25px;
  border: 2px solid #73ad21;
  background: white;
`;

const LiquidityItems = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
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

const Row = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 10px 0 10px 10px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: 10px;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 75%;
`;

const Image = styled.img`
  width: 32px;
  height: 32px;
`;
interface IProps {
  t: any;
}
interface IState {
  calc: any;
  inputAmount: any;
  outputAmount: any;
  inputAmountInWei: any;
  outputAmountInWei: any;
  loadingRemoveLp: Boolean;
  loading: boolean;
  switched: boolean;
}

enum Token {
  tokenA = 'tokenA',
  tokenB = 'tokenB',
}

export class AddLiquidity extends Component<IProps, IState> {
  static contextType = Context;
  private inputAmountRef = React.createRef<HTMLInputElement>();
  private outputAmountRef = React.createRef<HTMLInputElement>();

  constructor(props: any) {
    super(props);
    this.removeLiquidity = this.removeLiquidity.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      calc: 0,
      inputAmount: '',
      inputAmountInWei: BigNumber.from(0),
      outputAmountInWei: BigNumber.from(0),
      outputAmount: '',
      loadingRemoveLp: false,
      loading: false,
      switched: false,
    };
  }

  removeLiquidity = async (lpPairBalanceAccount: string) => {
    this.setState({
      loadingRemoveLp: true,
      loading: true,
    });

    const res = await this.context.removeLiquidity(lpPairBalanceAccount);

    if (res) {
      await this.context.getLiquidityOwner(
        this.context.tokenAData,
        this.context.tokenBData
      );
      this.setState({
        loadingRemoveLp: false,
        loading: false,
      });
    } else {
      console.log('Could not remove liquidity');
      this.setState({
        loadingRemoveLp: false,
        loading: false,
      });
    }
  };

  isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  toggleModal = (tokenBSelected: boolean) => {
    this.context.toggleTokenListModal(tokenBSelected);
  };

  resetFormFields = async () => {
    this.inputAmountRef.current.value = null;
    this.outputAmountRef.current.value = null;
    this.setState({
      inputAmount: null,
      outputAmount: null,
      inputAmountInWei: null,
      outputAmountInWei: null,
    });
  };

  handleSubmit = async (event: any) => {
    console.log('submit..');
    event.preventDefault();
    this.setState({ loading: true });

    try {
      if (this.state.outputAmountInWei && this.state.outputAmountInWei) {
        await this.context.addLiquidity(
          this.state.inputAmountInWei,
          this.state.outputAmountInWei
        );

        this.setState({ loading: false });
      }
    } catch (e: any) {
      console.log(`AddLiquidity:handleSubmit ${e.error}`);
      this.setState({
        loading: false,
      });
    }
  };

  handleTokenChanges = async (isTokenA: boolean) => {
    let inputAmount: any;
    let outputAmount: any;
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
       * !Switched && tokenA
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

              outputAmountInWei = this.context.toWei(
                outputAmount,
                this.context.tokenBData.decimals
              );

              this.outputAmountRef.current.value = outputAmount;
              await this.context.getLiquidityOwner(this.context.tokenAData);

              this.setState({
                inputAmount,
                outputAmount,
                inputAmountInWei,
                outputAmountInWei,
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
         *  !Switched && tokenB
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
          inputWithoutSpace,
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

              inputAmountInWei = this.context.toWei(
                inputAmount,
                this.context.tokenAData.decimals
              );
              this.inputAmountRef.current.value = inputAmount;
              this.context.getLiquidityOwner(this.context.tokenBData);

              this.setState({
                inputAmount,
                outputAmount,
                inputAmountInWei,
                outputAmountInWei,
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
      }
    } else {
      await this.resetFormFields();
    }
  };

  main = () => (
    <div id="content">
      <div className="card mb-4">
        <div className="card-body">
          <form
            autoComplete="off"
            className="mb-3"
            onSubmit={this.handleSubmit}
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
                  <p>{this.context.tokenABalance}</p>
                </span>
              </ColumnResult>
            </RowHeader>
            <div className="input-group mb-2">
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
              {this.state.calc > 0 ? (
                <>
                  <span className="float-left text-muted">Exchange Rate</span>
                  <br />
                  <span className="float-right text-muted">
                    <i style={{ margin: '3px' }}>1</i>
                    {this.context.tokenBData?.symbol} =
                    <i style={{ margin: '3px' }}>{this.state.calc}</i>
                    {this.context.tokenAData?.symbol}
                  </span>
                </>
              ) : null}
            </div>
            {this.context.correctNetwork && this.context.account ? (
              !this.state.loadingRemoveLp ? (
                !this.state.loading ? (
                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-lg"
                  >
                    {this.props.t('addLiquidity')}
                  </button>
                ) : (
                  <button className="btn btn-primary btn-block btn-lg" disabled>
                    <div className="spinner-border" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </button>
                )
              ) : (
                <button className="btn btn-primary btn-block btn-lg" disabled>
                  {this.props.t('addLiquidity')}
                </button>
              )
            ) : (
              <button className="btn btn-primary btn-block btn-lg" disabled>
                {this.props.t('connect')}
              </button>
            )}
          </form>
        </div>
      </div>

      {this.context.lpAccountShare > 0 ? (
        <Container>
          <LiquidityItems>
            <ColumnContainer>
              <Row>
                <Column>{this.props.t('poolShare')}</Column>
                <Column>
                  {(
                    Number.parseFloat(this.context.lpAccountShare) * 100
                  ).toFixed(2)}
                  %
                </Column>
              </Row>
              <Row>
                <Column>{this.props.t('ownedLp')} </Column>
                <Column>{this.context.lpPairBalanceAccount}</Column>
              </Row>
              <Row>
                <Column>
                  <Image src={this.context.tokenAData?.logoURI} />
                </Column>
                <Column>{this.context.tokenAShare}</Column>
              </Row>
              <Row>
                <Column>
                  <Image src={this.context.tokenBData?.logoURI} />
                </Column>
                <Column>{this.context.tokenBShare}</Column>
              </Row>
            </ColumnContainer>
            {!this.state.loading ? (
              this.context.lpAccountShare > 0 && !this.state.loadingRemoveLp ? (
                <button
                  type="submit"
                  className="btn  btn-block btn-lg removeLpButton"
                  onClick={() =>
                    this.removeLiquidity(this.context.lpPairBalanceAccount)
                  }
                >
                  {this.props.t('removeLiquidity')}
                </button>
              ) : (
                <button
                  className="btn btn-success btn-block btn-lg removeLpButton"
                  disabled
                >
                  <div className="spinner-border" role="status">
                    <span className="sr-only">{this.props.t('loading')}</span>
                  </div>
                </button>
              )
            ) : (
              <button className="btn  btn-block btn-lg removeLpButton" disabled>
                {this.props.t('removeLiquidity')}
              </button>
            )}
          </LiquidityItems>
        </Container>
      ) : null}
    </div>
  );

  render() {
    return this.main();
  }
}
export default AddLiquidity;
