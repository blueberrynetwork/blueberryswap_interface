import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import Context from './../Context';
import { ITokenData } from './../IStates/IApp';
import { FaExchangeAlt, FaCoins, FaAngleDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Migrator } from '../Migrator';

const Flex = styled.div`
  display: flex;
  justify-content: center;
`;

const Background = styled(Flex)`
  width: 100%;
  height: 160vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  position: absolute;
  top: 0;
  overflow: hidden;
`;

const ModalWrapper = styled.div`
  display: flex;
  justify-content: center;
  max-width: 350px;
  width: 350px;
  height: 650px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.2);
  background: #fff;
  color: #000;
  z-index: 9999999999;
  border-radius: 10px;
  position: absolute;
  top: 150px;
`;

const Image = styled.img`
  width: 32px;
  height: 32px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 40px 5px 5px 5px;
`;

const ContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const ContainerColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Column = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  position: relative;
  top: 10px;
`;

const ColumnBold = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  position: relative;
  top: 10px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const ColumnItalic = styled.i`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  position: relative;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
`;

const ColumnIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  position: relative;
  top: 10px;
`;

const Line = styled.hr`
  color: rgba(0, 0, 0, 0.65);
  width: 80%;
`;

interface IProps {
  active: boolean;
}
const Button = styled.button`
  background-color: ${(props: IProps) =>
    props.active ? 'rgb(31, 199, 212);' : '#FF99CC'};
  box-shadow: rgb(14 14 44 / 40%) 0px -1px 0px 0px inset;
  color: white;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  height: 60px;
  border: 0;
  border-radius: 15px;
  justify-content: center;
  letter-spacing: 0.03em;
  line-height: 1;
  margin: 30px 10px 0 10px;
`;

const ButtonDefault = styled.button`
  background-color: #d3d3d3;
  box-shadow: rgb(14 14 44 / 40%) 0px -1px 0px 0px inset;
  color: white;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  height: 60px;
  border: 0;
  border-radius: 15px;
  justify-content: center;
  letter-spacing: 0.03em;
  line-height: 1;
  margin: 30px 10px 0 10px;
`;

const ContainerInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 100px;
  margin: 15px;
`;

const LiquidityItems = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface IContext {
  tx: any;
  networkName: string;
  toggleTokenListModal(tokenBSelected: boolean): void;
  tokenAData: ITokenData;
  tokenBData: ITokenData;
  tokenAShare: any;
  lpPairBalanceAccount: any;
  lpAccountShare: any;
  tokenBShare: any;
  account: any;
  signer: any;
  provider: any;
}

export const ModalLiquidityMigrate = ({
  isOpenLiquidityMigrate,
  toggleLiquidityMigrate,
  toggleTokenListModal,
  openTransactionModal,
}) => {
  const [lpBalance, setLpBalance] = useState(0);

  const context = useContext(Context) as IContext;
  const { t } = useTranslation('common');

  const toggleItems = async (event: any) => {
    event.preventDefault();
    await toggleLiquidityMigrate();
  };

  const isObjectEmpty = (obj: any) => {
    return Object.keys(obj).length === 0 || Object.keys(obj).length === null;
  };

  useEffect(() => {
    let active = false;
    const lpBalanceByAccount = async () => {
      try {
        if (
          !isObjectEmpty(context.signer) &&
          context.account !== '' &&
          active
        ) {
          const lpBalance = await Migrator.getLPBalance(
            context.signer,
            context.account
          );
          setLpBalance(lpBalance);
        }
      } catch (e: any) {
        console.log(e);
      }
    };
    lpBalanceByAccount();
  }, [lpBalance, context.signer, context.account]);

  const toggleModal = (tokenBSelected: boolean) => {
    console.log('toggleModal..');
    toggleTokenListModal(tokenBSelected);
    console.log(context.tokenAData, context.tokenBData);
  };

  const submit = async (e: any) => {
    await e.preventDefault();
    try {
      if (!isObjectEmpty(context.signer) && context.account !== '') {
        const { tx } = await Migrator.migrate(
          context.tokenAData,
          context.tokenBData,
          context.account,
          context.signer,
          context.provider
        );
        await openTransactionModal(tx);
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  return (
    <>
      {isOpenLiquidityMigrate ? (
        <Background>
          <ModalWrapper>
            <Container>
              <ContainerRow>
                <ContainerColumn>
                  <ColumnIcon>
                    <FaExchangeAlt size="50" color="#00BFFF"></FaExchangeAlt>
                  </ColumnIcon>
                  <ColumnBold>{t('migratorHeaderText')}</ColumnBold>
                  <ColumnItalic>Migrate with Permit</ColumnItalic>
                  <>
                    <Column>
                      <div
                        className="input-group-append"
                        onClick={() => toggleModal(false)}
                      >
                        {context.tokenAData?.symbol ? (
                          <div className="input-group-text">
                            <Image src={context.tokenAData?.logoURI}></Image>
                            &nbsp; {context.tokenAData?.symbol}
                            <FaAngleDown />
                          </div>
                        ) : (
                          <div className="input-group-text">
                            {t('select')}
                            <FaAngleDown />
                          </div>
                        )}
                      </div>
                    </Column>
                    <Column>
                      <div
                        className="input-group-append"
                        onClick={() => toggleModal(true)}
                      >
                        {context.tokenBData?.symbol ? (
                          <div className="input-group-text">
                            <Image src={context.tokenBData?.logoURI}></Image>
                            &nbsp; {context.tokenBData?.symbol} <FaAngleDown />
                          </div>
                        ) : (
                          <div className="input-group-text">
                            {t('select')}
                            <FaAngleDown />
                          </div>
                        )}
                      </div>
                    </Column>
                    <Line />
                    <ContainerInfo>
                      {lpBalance > 0 ? (
                        <LiquidityItems>
                          <ColumnContainer>
                            <Row>
                              <Column>
                                <FaCoins size="30" color="#FFD700" />
                              </Column>
                            </Row>
                            <Row>
                              <Column>{lpBalance}</Column>
                            </Row>
                          </ColumnContainer>
                        </LiquidityItems>
                      ) : (
                        <ContainerInfo>{t('noLiquidityExists')}</ContainerInfo>
                      )}
                    </ContainerInfo>
                  </>
                </ContainerColumn>
              </ContainerRow>
              <ContainerRow>
                {lpBalance > 0 ? (
                  <Button active={true} onClick={submit}>
                    {t('migrate')}
                  </Button>
                ) : (
                  <ButtonDefault disabled>
                    {t('migrate')}
                    <br /> <i>(No lp)</i>
                  </ButtonDefault>
                )}
                <Button active={true} onClick={toggleItems}>
                  {t('close')}
                </Button>
              </ContainerRow>
            </Container>
          </ModalWrapper>
        </Background>
      ) : null}
    </>
  );
};
