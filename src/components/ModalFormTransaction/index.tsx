import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { FaRegArrowAltCircleUp } from 'react-icons/fa';
import Context from './../Context';

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
  align-items: center;
  top: 0;
  overflow: hidden;
  z-index: 9;
`;

const ModalWrapper = styled.div`
  display: flex;
  justify-content: center;
  max-width: 350px;
  width: 350px;
  height: 400px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.2);
  background: #fff;
  color: #000;
  z-index: 10;
  border-radius: 10px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 450px;
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
`;

const ColumnIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  position: relative;
  top: 10px;
`;

const Button = styled.button`
  background-color: rgb(31, 199, 212);
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
  margin: 80px 10px 0 10px;
`;

interface IContext {
  tx: any;
  networkName: string;
}

export const ModalFormTransaction = ({ isOpen, toggleNetworkTransaction }) => {
  const context = useContext(Context) as IContext;

  useEffect(() => {}, []);

  const toggleItems = (event: any) => {
    event.preventDefault();
    toggleNetworkTransaction();
  };

  return (
    <>
      {isOpen ? (
        <Background>
          <ModalWrapper>
            <Container>
              <ContainerRow>
                <ContainerColumn>
                  <ColumnIcon>
                    <FaRegArrowAltCircleUp
                      size="50"
                      color="#00CED1"
                    ></FaRegArrowAltCircleUp>
                  </ColumnIcon>
                  <ColumnBold>Transaction Submitted</ColumnBold>
                  {context.networkName === 'BSC' ? (
                    <Column>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://bscscan.com/tx/${context.tx}`}
                      >
                        <p style={{ color: '#ff8c00' }}>
                          View on the BSC Explorer
                        </p>
                      </a>
                    </Column>
                  ) : (
                    <Column>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://snowtrace.io/tx/${context.tx}`}
                      >
                        <p style={{ color: '#ff4500' }}>
                          View on the SnowTrace Explorer
                        </p>
                      </a>
                    </Column>
                  )}
                </ContainerColumn>
              </ContainerRow>
              <ContainerRow>
                <Button onClick={toggleItems}>Close</Button>
              </ContainerRow>
            </Container>
          </ModalWrapper>
        </Background>
      ) : null}
    </>
  );
};
