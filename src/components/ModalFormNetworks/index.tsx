import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Flex = styled.div`
  display: flex;
  justify-content: center;
`;

const Background = styled(Flex)`
  width: 100%;
  height: 120vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  position: absolute;
  align-items: center;
  top: 0;
  overflow: hidden;
`;

const ModalWrapper = styled.div`
  display: flex;
  justify-content: center;
  max-width: 350px;
  width: 350px;
  height: 200px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.2);
  background: #fff;
  color: #000;
  z-index: 10;
  border-radius: 10px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  flex-direction: row;
  justify-content: flex-end;
`;

const CloseIcon = styled(Flex)`
  align-items: center;
  cursor: pointer;
  float: right;
  padding: 5px 15px 0 0;
`;

const Container = styled.div`
  max-height: 350px;
  width: 100%;
  margin: 5px;
`;

const ContainerRow = styled.div`
  display: flex;
  flex-direction: row;
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

interface IProps {
  active: boolean;
}

const Button = styled.button`
  background-color: ${(props: IProps) =>
    props.active ? 'rgb(31, 199, 212);' : '#fff'};
  box-shadow: rgb(14 14 44 / 40%) 0px -1px 0px 0px inset;
  color: white;
  cursor: pointer;
  font-weight: 600;
  width: 60px;
  height: 60px;
  margin: 5px;
  border: 0;
  border-radius: 25px;
  justify-content: center;
  letter-spacing: 0.03em;
  line-height: 1;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
`;

enum NETWORKS {
  BSC = 'BSC',
  AVAX = 'AVAX',
}

enum ButtonList {
  FirstButton,
  SecondButton,
  ThirdButton,
}

export const ModalFormNetworks = ({
  isOpen,
  toggleNetworkModal,
  setNetwork,
}) => {
  const [firstButton, setFirstButton] = useState(true);
  const [secondButton, setSecondButton] = useState(false);
  useEffect(() => {
    const networkName = window.localStorage.getItem('networkName');

    const setSelectedNetwork = () => {
      if (networkName === NETWORKS.BSC || networkName == null) {
        setFirstButton(true);
      } else {
        setSecondButton(true);
      }
    };
    setSelectedNetwork();
  }, [firstButton]);

  const changeNetwork = (buttonIndex: number) => {
    if (buttonIndex === ButtonList.FirstButton) {
      setNetwork('BSC', true);
      setFirstButton(true);
      setSecondButton(false);
    }
    if (buttonIndex === ButtonList.SecondButton) {
      setNetwork('AVAX', true);
      setFirstButton(false);
      setSecondButton(true);
    }
  };

  const toggleItems = (event: any) => {
    event.preventDefault();
    toggleNetworkModal();
  };

  return (
    <>
      {isOpen ? (
        <Background>
          <ModalWrapper className="ModalWrapper">
            <Container>
              <Header>
                <CloseIcon onClick={toggleItems}>X</CloseIcon>
              </Header>
              <ContainerRow>
                <Column>BSC</Column>
                <Column>AVAX</Column>
              </ContainerRow>
              <ContainerRow>
                <Button active={firstButton} onClick={() => changeNetwork(0)}>
                  <Logo
                    src={
                      'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
                    }
                  />
                </Button>
                <Button active={secondButton} onClick={() => changeNetwork(1)}>
                  <Logo
                    src={
                      'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png'
                    }
                  />
                </Button>
                {/* <Button active={thirdButton} onClick={() => changeNetwork(2)}>
                  <Logo
                    src={
                      'https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png'
                    }
                  />
                </Button> */}
              </ContainerRow>
            </Container>
          </ModalWrapper>
        </Background>
      ) : null}
    </>
  );
};
