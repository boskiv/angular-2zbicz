import { getAllSymbols } from '@app/utils/v2/resolveSymbols';
import { IDatafeedChartApi } from '@assets/charting_library';

export const searchSymbols: IDatafeedChartApi['searchSymbols'] = async (
  userInput,
  exchange,
  _symbolType,
  onResultReadyCallback
) => {
  const symbols = await getAllSymbols();
  const newSymbols = symbols.filter((symbol) => {
    const isExchangeValid = exchange === '' || symbol.exchange === exchange;
    const isFullSymbolContainsInput =
      symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
    return isExchangeValid && isFullSymbolContainsInput;
  });
  onResultReadyCallback(newSymbols);
};
