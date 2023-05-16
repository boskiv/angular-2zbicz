import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  constructor() {}

  playSound(symbol: string, side: string) {
    let audio = new Audio();
    audio.src = `assets/sounds/signals/${side}/${symbol.toUpperCase()} ${side}.mp3`;
    audio.load();
    audio.play();
  }
}
