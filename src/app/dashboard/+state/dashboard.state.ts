import { Injectable } from '@angular/core';

import {
  AddFavorite,
  AddLayout,
  AddNewPane,
  ChangePaneColor,
  ChangePaneInterval,
  ChangePaneSymbol,
  ClearLayout,
  CopyCurrentLayout,
  DeleteLayout,
  FavoriteClicked,
  HiLowItemClicked,
  LiquidationClicked,
  LoadLayout,
  NewsCurrencyClicked,
  PrePumpClicked,
  RemoveFavorite,
  RemovePane,
  RenameCurrentLayout,
  SetFreshUpdates,
  SetVolume,
  SignalClicked,
  SpikeClicked,
  StopKillerClicked,
  ToggleAutoSave,
  ToggleLockDashboard,
  ToggleResizable,
  TopItemClicked,
  UpdateFavorite,
  UpdatePane,
  UpdateWidgetFilter,
} from '@app/dashboard/+state/dashboard.actions';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { StoreOptions } from '@ngxs/store/src/symbols';
import { GridsterItem } from 'angular-gridster2';
import { v4 as uuidv4 } from 'uuid';

export enum PaneType {
  Default,
  Signal,
  HiLow,
  Chart,
  Liquidations,
  Positions,
  Orders,
  Favorites,
  Strategies,
  Manipulations,
  Top,
  Chat,
  News,
  PlatformUpdates,
  StopKiller,
  PrePumpDetector,
  PremiumIndex,
  Dog,
  Calendar,
}

export class PaneTypeToGridMaxRows {
  static [PaneType.Default]: number = 12;
  static [PaneType.Signal]: number = 12;
  static [PaneType.Calendar]: number = 12;
  static [PaneType.Chart]: number = 12;
  static [PaneType.HiLow]: number = 12;
  static [PaneType.Liquidations]: number = 12;
  static [PaneType.Positions]: number = 12;
  static [PaneType.Orders]: number = 12;
  static [PaneType.Favorites]: number = 12;
  static [PaneType.Strategies]: number = 12;
  static [PaneType.Manipulations]: number = 12;
  static [PaneType.Top]: number = 12;
  static [PaneType.Chat]: number = 12;
  static [PaneType.News]: number = 12;
  static [PaneType.PlatformUpdates]: number = 12;
  static [PaneType.StopKiller]: number = 12;
  static [PaneType.PrePumpDetector]: number = 8;
  static [PaneType.PremiumIndex]: number = 8;
  static [PaneType.Dog]: number = 12;
}

export class PaneTypeToGridMinCols {
  static [PaneType.Default]: number = 6;
  static [PaneType.Signal]: number = 6;
  static [PaneType.Calendar]: number = 8;
  static [PaneType.Chart]: number = 12;
  static [PaneType.HiLow]: number = 12;
  static [PaneType.Liquidations]: number = 6;
  static [PaneType.Positions]: number = 6;
  static [PaneType.Orders]: number = 6;
  static [PaneType.Favorites]: number = 6;
  static [PaneType.Strategies]: number = 8;
  static [PaneType.Manipulations]: number = 12;
  static [PaneType.Top]: number = 8;
  static [PaneType.Chat]: number = 8;
  static [PaneType.News]: number = 8;
  static [PaneType.PlatformUpdates]: number = 8;
  static [PaneType.StopKiller]: number = 8;
  static [PaneType.PrePumpDetector]: number = 5;
  static [PaneType.PremiumIndex]: number = 8;
  static [PaneType.Dog]: number = 10;
}

export interface IDashboardWidget extends GridsterItem {
  id: string;
  color: string;
  type: PaneType;
  meta: {
    symbol?: any;
    interval?: any;
    filter?: {
      [key: string]: any;
    };
  };
}

export interface IDashboardLayout {
  id: string;
  name: string;
  widgets: { [widgetID: string]: IDashboardWidget };
  favorites: IFavoriteItem[];
}

export interface ISignal {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
}

export interface IFavoriteItem {
  id: string;
  symbol: string;
}

export interface IDashboardStateModel {
  currentLayoutID: string;
  freshUpdates: boolean;
  volume: number;
  layouts: { [layoutID: string]: IDashboardLayout };
  layoutSettings: {
    autoSave: boolean;
    lock: boolean;
    isAdvancedMode: boolean;
  };
}

const defaultLayout: IDashboardLayout = {
  id: uuidv4(),
  name: 'Default',
  favorites: [],
  widgets: {},
};

const defaultStateOptions: StoreOptions<IDashboardStateModel> = {
  name: 'dashboard',
  defaults: {
    volume: 70,
    freshUpdates: false,
    currentLayoutID: defaultLayout.id,
    layouts: { [defaultLayout.id]: defaultLayout },
    layoutSettings: {
      autoSave: true,
      lock: false,
      isAdvancedMode: false,
    },
  },
};

@State<IDashboardStateModel>(defaultStateOptions)
@Injectable()
export class DashboardState {
  @Selector()
  static favorites(state: IDashboardStateModel) {
    return state.layouts[state.currentLayoutID].favorites;
  }

  @Selector()
  static layouts(state: IDashboardStateModel) {
    return state.layouts;
  }

  @Selector()
  static autoSave(state: IDashboardStateModel) {
    return state.layoutSettings.autoSave;
  }

  @Selector()
  static isAdvancedMode(state: IDashboardStateModel) {
    return state.layoutSettings.isAdvancedMode;
  }

  @Selector()
  static lockDashboard(state: IDashboardStateModel) {
    return state.layoutSettings.lock;
  }

  @Selector()
  static freshUpdates(state: IDashboardStateModel) {
    return state.freshUpdates;
  }

  @Selector()
  static volume(state: IDashboardStateModel) {
    return state.volume;
  }

  @Selector()
  static layoutsArray(state: IDashboardStateModel) {
    return Object.values(state.layouts);
  }

  @Action([AddNewPane])
  addPane(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { payload }: AddNewPane
  ) {
    console.log(payload);
    const state = getState();
    const currentLayoutID = state.currentLayoutID;
    const newLayouts = { ...state.layouts };
    newLayouts[currentLayoutID].widgets[payload.id] = payload;
    patchState({
      layouts: newLayouts,
    });
  }

  @Action(RemovePane)
  removePane(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { payload }: RemovePane
  ) {
    const state = getState();
    const currentLayoutID = state.currentLayoutID;
    const newWidgets = { ...state.layouts[currentLayoutID].widgets };
    delete newWidgets[payload.id];
    const newLayouts = { ...state.layouts };
    newLayouts[currentLayoutID].widgets = newWidgets;
    patchState({
      layouts: newLayouts,
    });
  }

  @Action(UpdatePane)
  resizePane(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { payload }: UpdatePane
  ) {
    const state = getState();

    const layouts = { ...state.layouts };
    const currentLayoutID = state.currentLayoutID;

    layouts[currentLayoutID].widgets[payload.id].cols = payload.cols;
    layouts[currentLayoutID].widgets[payload.id].rows = payload.rows;
    layouts[currentLayoutID].widgets[payload.id].x = payload.x;
    layouts[currentLayoutID].widgets[payload.id].y = payload.y;
    patchState({
      layouts,
    });
  }

  @Action(ChangePaneColor)
  changePaneColor(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { payload }: ChangePaneColor
  ) {
    const state = getState();
    const currentLayoutID = state.currentLayoutID;
    const currentWidgets = state.layouts[currentLayoutID].widgets;
    const widget = currentWidgets[payload.id];

    const newLayouts = {
      ...state.layouts,
      [currentLayoutID]: {
        ...state.layouts[currentLayoutID],
        widgets: {
          ...currentWidgets,
          [payload.id]: {
            ...widget,
            color: payload.color,
          },
        },
      },
    };
    patchState({
      layouts: newLayouts,
    });
  }

  @Action(ChangePaneInterval)
  changePaneInterval(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { payload }: ChangePaneInterval
  ) {
    const state = getState();

    const layouts = { ...state.layouts };
    const currentLayoutID = state.currentLayoutID;

    layouts[currentLayoutID].widgets[payload.id].meta.interval =
      payload.interval;

    patchState({
      layouts,
    });
  }

  @Action(ChangePaneSymbol)
  changePaneSymbol(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { payload }: ChangePaneSymbol
  ) {
    const state = getState();

    const newWidgets = Object.values(
      state.layouts[state.currentLayoutID].widgets
    ).reduce((acc, widget) => {
      if (
        widget.color ===
          state.layouts[state.currentLayoutID].widgets[payload.id].color &&
        widget.meta?.symbol !== payload.symbol
      ) {
        widget = {
          ...widget,
          meta: {
            ...widget.meta,
            symbol: payload.symbol,
          },
        };
      }
      // @ts-ignore
      acc[widget.id] = widget;
      return acc;
    }, {});
    const newLayouts = {
      ...state.layouts,
      [state.currentLayoutID]: {
        ...state.layouts[state.currentLayoutID],
        widgets: newWidgets,
      },
    };

    patchState({
      layouts: newLayouts,
    });
  }

  @Action([
    SignalClicked,
    FavoriteClicked,
    SpikeClicked,
    HiLowItemClicked,
    TopItemClicked,
    LiquidationClicked,
    StopKillerClicked,
    NewsCurrencyClicked,
  ])
  symbolClicked(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    {
      payload,
      color,
    }:
      | SignalClicked
      | FavoriteClicked
      | SpikeClicked
      | PrePumpClicked
      | TopItemClicked
      | HiLowItemClicked
      | LiquidationClicked
      | StopKillerClicked
      | NewsCurrencyClicked
  ) {
    const state = getState();
    const widgets = state.layouts[state.currentLayoutID].widgets;

    const newWidgets = Object.values(widgets).reduce(
      (acc: IDashboardWidget, widget) => {
        if (widget.color === color) {
          widget = {
            ...widget,
            meta: {
              ...widget.meta,
              symbol: payload.symbol,
            },
          };
        }
        acc[widget.id] = widget;
        return acc;
      },
      {} as IDashboardWidget
    );

    const newLayouts = {
      ...state.layouts,
      [state.currentLayoutID]: {
        ...state.layouts[state.currentLayoutID],
        widgets: newWidgets,
      },
    };
    patchState({
      layouts: newLayouts,
    });
  }

  @Action(AddFavorite)
  addFavorite(
    { patchState, getState }: StateContext<IDashboardStateModel>,
    { symbol }: AddFavorite
  ) {
    const state = getState();
    const layouts = { ...state.layouts };
    layouts[state.currentLayoutID].favorites.push({
      id: uuidv4(),
      symbol,
    });

    patchState({
      layouts,
    });
  }

  @Action(RemoveFavorite)
  removeFavorite(
    { patchState, getState }: StateContext<IDashboardStateModel>,
    { symbol }: RemoveFavorite
  ) {
    const state = getState();
    const layouts = { ...state.layouts };
    layouts[state.currentLayoutID].favorites = state.layouts[
      state.currentLayoutID
    ].favorites.filter((fav) => fav.symbol !== symbol);

    patchState({
      layouts,
    });
  }

  @Action(UpdateFavorite)
  updateFavorite(
    { patchState, getState }: StateContext<IDashboardStateModel>,
    { favoriteItem }: UpdateFavorite
  ) {
    const state = getState();
    const layouts = { ...state.layouts };
    const index = layouts[state.currentLayoutID].favorites.findIndex(
      (fav) => fav.symbol === favoriteItem.symbol
    );
    layouts[state.currentLayoutID].favorites[index] = favoriteItem;

    patchState({
      layouts,
    });
  }

  @Action(ToggleAutoSave)
  toggleAutoSave({ getState, patchState }: StateContext<IDashboardStateModel>) {
    const state = getState();

    patchState({
      layoutSettings: {
        autoSave: !state.layoutSettings.autoSave,
        lock: state.layoutSettings.lock,
        isAdvancedMode: state.layoutSettings.isAdvancedMode,
      },
    });
  }

  @Action(UpdateWidgetFilter)
  updateWidgetFilter(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { widgetId, filter }: UpdateWidgetFilter
  ) {
    const state = getState();
    const layouts = { ...state.layouts };
    layouts[state.currentLayoutID].widgets[widgetId].meta.filter = filter;
    patchState({
      layouts,
    });
  }

  @Action(ToggleResizable)
  toggleResizable({
    getState,
    patchState,
  }: StateContext<IDashboardStateModel>) {
    const state = getState();
    let newWidgets = {} as IDashboardWidget;
    // delete key from widgets
    if (!state.layoutSettings.isAdvancedMode) {
      Object.keys(state.layouts[state.currentLayoutID].widgets).forEach(
        (key) => {
          newWidgets[key] = state.layouts[state.currentLayoutID].widgets[key];
          delete newWidgets[key].maxItemRows;
          delete newWidgets[key].minItemCols;
        }
      );
    } else {
      Object.keys(state.layouts[state.currentLayoutID].widgets).forEach(
        (key) => {
          newWidgets[key] = {
            ...state.layouts[state.currentLayoutID].widgets[key],
            maxItemRows:
              PaneTypeToGridMaxRows[
                state.layouts[state.currentLayoutID].widgets[key].type
              ],
            minItemCols:
              PaneTypeToGridMinCols[
                state.layouts[state.currentLayoutID].widgets[key].type
              ],
            cols: PaneTypeToGridMinCols[
              state.layouts[state.currentLayoutID].widgets[key].type
            ],
            rows: PaneTypeToGridMaxRows[
              state.layouts[state.currentLayoutID].widgets[key].type
            ],
          };
        }
      );
    }

    patchState({
      ...state,
      layouts: {
        ...state.layouts,
        [state.currentLayoutID]: {
          ...state.layouts[state.currentLayoutID],
          widgets: newWidgets,
        },
      },
      layoutSettings: {
        autoSave: state.layoutSettings.autoSave,
        lock: state.layoutSettings.lock,
        isAdvancedMode: !state.layoutSettings.isAdvancedMode,
      },
    });
  }

  @Action(SetFreshUpdates)
  setFreshUpdates(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { isFresh }: SetFreshUpdates
  ) {
    const state = getState();

    patchState({
      freshUpdates: isFresh,
    });
  }

  @Action(SetVolume)
  setVolume(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { volume }: SetVolume
  ) {
    const state = getState();

    patchState({
      volume: volume,
    });
  }

  @Action(ToggleLockDashboard)
  toggleLockDashboard({
    getState,
    patchState,
  }: StateContext<IDashboardStateModel>) {
    const state = getState();

    patchState({
      layoutSettings: {
        autoSave: state.layoutSettings.autoSave,
        lock: !state.layoutSettings.lock,
        isAdvancedMode: state.layoutSettings.isAdvancedMode,
      },
    });
  }

  @Action(AddLayout)
  addLayout(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { layout }: AddLayout
  ) {
    const state = getState();
    const layouts = {
      ...state.layouts,
      [layout.id]: layout,
    };

    patchState({
      layouts,
      currentLayoutID: layout.id,
    });
  }

  @Action(RenameCurrentLayout)
  renameLayout(
    { patchState, getState }: StateContext<IDashboardStateModel>,
    { name }: RenameCurrentLayout
  ) {
    const state = getState();
    const layouts = { ...state.layouts };
    layouts[state.currentLayoutID].name = name;

    patchState({
      layouts,
    });
  }

  @Action(CopyCurrentLayout)
  copyLayout({ patchState, getState }: StateContext<IDashboardStateModel>) {
    const state = getState();
    const layout = state.layouts[state.currentLayoutID];
    const newLayout = {
      ...layout,
      id: uuidv4(),
      name: layout.name + ' (copy)',
    };
    patchState({
      layouts: {
        ...state.layouts,
        [newLayout.id]: newLayout,
      },
      currentLayoutID: newLayout.id,
    });
  }

  @Action(LoadLayout)
  loadLayout(
    { patchState }: StateContext<IDashboardStateModel>,
    { layoutID }: LoadLayout
  ) {
    patchState({
      currentLayoutID: layoutID,
    });
  }

  @Action(DeleteLayout)
  deleteLayout(
    { getState, patchState }: StateContext<IDashboardStateModel>,
    { layoutID }: DeleteLayout
  ) {
    const state = getState();
    const layouts = { ...state.layouts };
    delete layouts[layoutID];
    patchState({
      layouts,
      currentLayoutID:
        state.currentLayoutID === layoutID
          ? Object.keys(layouts)[0]
          : state.currentLayoutID,
    });
  }

  @Action(ClearLayout)
  clearLayout({ getState, patchState }: StateContext<IDashboardStateModel>) {
    const state = getState();
    const layouts = { ...state.layouts };
    layouts[state.currentLayoutID].widgets = {};
    patchState({
      layouts,
    });
  }
}
