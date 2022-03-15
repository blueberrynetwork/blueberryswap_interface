import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { createChart, CrosshairMode } from 'lightweight-charts';

import { useQuery, gql } from '@apollo/client';

const avaxImg = 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png';

const LegendContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-left: 15px;
`;

const LEGEND = styled.div`
  color: white;
  position: relative;
  top: 5em;
  z-index: 9999;
  padding: 0 5px 0 5px;
`;

const ChartLegendIcons = styled.img`
  width: 35px;
  height: 35px;
`;

class PriceData {
  constructor(public time: any, public value: any) {}
}

class PricChartData {
  constructor(
    public id: string,
    public date: any,
    public reserve0: string,
    public reserve1: string
  ) {}

  createTimeValueChartData() {
    let price =
      Number.parseFloat(this.reserve1) / Number.parseFloat(this.reserve0);
    return new PriceData(this.date, price);
  }
}

interface IPairDayDatas {
  id: string;
  date: number;
  reserve0: string;
  reserve1: string;
}

interface IPairData {
  pairDayDatas: IPairDayDatas[];
}

function PriceChart() {
  const chartContainerRef: any = useRef();
  const chart: any = useRef();
  const resizeObserver: any = useRef();

  const [latestPrice, setLatestPrice] = useState('');

  const EXCHANGE_RATES = gql`
    query {
      pairDayDatas(
        where: {
          pairAddress: "0x21098D22d62D2b04CCBF76A53b75E65Ec6f2c20C"
          date_gt: 1641340456
        }
      ) {
        date
        dailyVolumeToken0
        dailyVolumeToken1
        reserve0
        reserve1
      }
    }
  `;
  const { loading, error, data } = useQuery<IPairData>(EXCHANGE_RATES);

  useEffect(() => {
    if (error) {
      console.log(error);
      console.log('Error occured');
    }
    if (!loading && data) {
      const priceData = data.pairDayDatas.map((item: IPairDayDatas) => {
        return new PricChartData(
          item.id,
          item.date,
          item.reserve0,
          item.reserve1
        ).createTimeValueChartData();
      });

      const lastPrice = Number.parseFloat(
        priceData[priceData.length - 1].value
      ).toFixed(14);

      chart.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500, //"300px",
        layout: {
          backgroundColor: '#253248',
          textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
          vertLines: {
            color: '#334158',
          },
          horzLines: {
            color: '#334158',
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        timeScale: {
          borderColor: '#485c7b',
        },
      });
      const candleSeries = chart.current.addLineSeries({
        upColor: '#4bffb5',
        downColor: '#ff4976',
        borderDownColor: '#ff4976',
        borderUpColor: '#4bffb5',
        wickDownColor: '#838ca1',
        wickUpColor: '#838ca1',
      });
      candleSeries.applyOptions({
        priceFormat: {
          type: 'price',
          precision: 14,
          minMove: 0.00000000000001,
        },
      });

      candleSeries.setData(priceData);
      setLatestPrice(lastPrice);

      resizeObserver.current = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        chart.current.applyOptions({
          width,
          height,
        });
        setTimeout(() => {
          chart.current.timeScale().fitContent();
        }, 0);
      });
      resizeObserver.current.observe(chartContainerRef.current);
      return () => resizeObserver.current.disconnect();
    }
  }, [loading, data, error]);

  return (
    <div>
      {loading ? (
        <div className="priceChartSpinner">
          <div className="spinner-border " role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="chartContainer">
            <div
              style={{ color: 'white', position: 'absolute', top: '8em' }}
            ></div>

            <LegendContainer>
              <LEGEND>
                Price Chart: WAVAX/Blueberry <br />
                <pre style={{ color: 'orange' }}>{latestPrice}</pre>
              </LEGEND>
              <LEGEND>
                <a href="https://snowtrace.io/address/0x17d348eaa30f191ee34c3de874ba9989f259e44c">
                  <ChartLegendIcons src={avaxImg}></ChartLegendIcons>
                </a>
              </LEGEND>
            </LegendContainer>

            <div ref={chartContainerRef} className="chart-container" />
          </div>
        </>
      )}
    </div>
  );
}
export default PriceChart;
