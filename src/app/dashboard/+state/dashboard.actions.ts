import {
  IDashboardLayout,
  IDashboardWidget,
  IFavoriteItem,
  ISignal,
} from '@app/dashboard/+state/dashboard.state';
import { ILiquidation } from '@app/dashboard/components/liquidations-pane/liquidations-pane.component';
import { IHiLow } from '@app/dashboard/services/hi-low.service';
import { TopItem } from '@app/dashboard/services/manipulation.service';
import { ISpike } from '@app/dashboard/services/spike.service';
import { IStopKiller } from '@app/dashboard/services/stopkiller.service';
import { IVolumeActivity } from '@app/dashboard/services/volume-activity.service';
import { v4 as uuidv4 } from 'uuid';

export class AddFavorite {
  static readonly type = '[Dashboard] AddFavorite';
  constructor(public symbol: string) {}
}

export class AddNewPane {
  static readonly type = '[Dashboard] AddNewPane';
  constructor(public payload: IDashboardWidget) {}
}

export class UpdatePane {
  static readonly type = '[Dashboard] UpdatePane';
  constructor(public payload: IDashboardWidget) {}
}

export class RemovePane {
  static readonly type = '[Dashboard] RemovePane';
  constructor(public payload: { id: string }) {}
}

export class ChangePaneSymbol {
  static readonly type = '[Dashboard] ChangeSymbol';
  constructor(public payload: { id: string; symbol: string }) {}
}

export class ChangePaneInterval {
  static readonly type = '[Dashboard] ChangeInterval';
  constructor(public payload: { id: string; interval: string }) {}
}

export class ChangePaneColor {
  static readonly type = '[Dashboard] ChangePaneColor';
  constructor(public payload: IDashboardWidget) {}
}

export class SignalClicked {
  static readonly type = '[Dashboard] SignalClicked';
  constructor(public payload: ISignal, public color: string) {}
}

export class NewsCurrencyClicked {
  static readonly type = '[Dashboard] NewsCurrencyClick';
  constructor(public payload: { symbol: string }, public color: string) {}
}

export class LiquidationClicked {
  static readonly type = '[Dashboard] LiquidationClicked';
  constructor(public payload: ILiquidation, public color: string) {}
}

export class FavoriteClicked {
  static readonly type = '[Dashboard] FavoriteClicked';
  constructor(public payload: IFavoriteItem, public color: string) {}
}

export class PrePumpClicked {
  static readonly type = '[Dashboard] FavoriteClicked';
  constructor(public payload: IVolumeActivity, public color: string) {}
}

export class SpikeClicked {
  static readonly type = '[Dashboard] SpikeClicked';
  constructor(public payload: ISpike, public color: string) {}
}

export class StopKillerClicked {
  static readonly type = '[Dashboard] Stop Killer Clicked';
  constructor(public payload: IStopKiller, public color: string) {}
}

export class TopItemClicked {
  static readonly type = '[Dashboard] TopItemClicked';
  constructor(public payload: TopItem, public color: string) {}
}

export class HiLowItemClicked {
  static readonly type = '[Dashboard] HiLowItemClicked';
  constructor(public payload: IHiLow, public color: string) {}
}

export class UpdateFavorite {
  static readonly type = '[Dashboard] UpdateFavorite';
  constructor(public favoriteItem: IFavoriteItem) {}
}

export class UpdateWidgetFilter {
  static readonly type = '[Dashboard] Update Widget Filter';
  constructor(public widgetId: string, public filter: { [key: string]: any }) {}
}

export class RemoveFavorite {
  static readonly type = '[Dashboard] RemoveFavorite';
  constructor(public symbol: string) {}
}

export class ToggleAutoSave {
  static readonly type = '[Dashboard] Toggle Auto Save Layout';
  constructor() {}
}

export class ToggleResizable {
  static readonly type = '[Dashboard] Toggle Resize Enabled Layout';
  constructor() {}
}

export class ToggleLockDashboard {
  static readonly type = '[Dashboard] Toggle Lock Layout';
  constructor() {}
}

export class SetFreshUpdates {
  static readonly type = '[Dashboard] Set Fresh Updates';
  constructor(public isFresh: boolean) {}
}

export class SetVolume {
  static readonly type = '[Dashboard] Set Volume';
  constructor(public volume: number) {}
}

export class ClearLayout {
  static readonly type = '[Dashboard] Clear Layout';
  constructor() {}
}

export class RenameCurrentLayout {
  static readonly type = '[Dashboard] Rename Current Layout';
  constructor(public name: string) {}
}

export class CopyCurrentLayout {
  static readonly type = '[Dashboard] Copy Current Layout';
  constructor() {}
}

export class AddLayout {
  static readonly type = '[Dashboard] Add Layout';
  constructor(
    public layout: IDashboardLayout = {
      id: uuidv4(),
      name: 'New layout',
      widgets: {},
      favorites: [],
    }
  ) {}
}

export class LoadLayout {
  static readonly type = '[Dashboard] Load Layout';
  constructor(public layoutID: string) {}
}

export class DeleteLayout {
  static readonly type = '[Dashboard] Delete Layout';
  constructor(public layoutID: string) {}
}
