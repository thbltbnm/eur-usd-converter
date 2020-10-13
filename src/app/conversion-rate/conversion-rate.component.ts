import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Observable, of, Subject, timer } from 'rxjs';
import { map, retry, share, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-conversion-rate',
  templateUrl: './conversion-rate.component.html',
  styleUrls: ['./conversion-rate.component.scss']
})
export class ConversionRateComponent implements OnInit, OnDestroy {
  converterForm: FormGroup;

  euroToUsd = true;

  euroToUsdRealRate: number;
  usdToEuroRealRate: number;

  euroToUsdFixedRate: number;
  usdToEuroFixedRate: number;
  convertedValue: number;

  private stopPolling = new Subject();

  constructor() {}

  ngOnInit(): void {
    this.converterForm = new FormGroup({
      initialValue: new FormControl(null)
    });

    timer(0, 3000)
      .pipe(
        map(() => this.getRandomRate()),
        retry(),
        share(),
        takeUntil(this.stopPolling)
      )
      .subscribe((rate) => {
        this.euroToUsdRealRate = rate;
        this.usdToEuroRealRate = 1 / this.euroToUsdRealRate;
        this.updateConvertedValue();
      });
  }

  get initialValue(): AbstractControl {
    if (this.converterForm) {
      return this.converterForm.get('initialValue');
    }
  }

  getRandomRate(): number {
    return Math.random() * (2 - 0.5) + 0.5;
  }

  updateConvertedValue(): void {
    this.euroToUsd
      ? (this.convertedValue = this.initialValue.value * this.euroToUsdRealRate)
      : (this.convertedValue = this.initialValue.value * this.usdToEuroRealRate);
  }

  toggleConversion(): void {
    this.euroToUsd = !this.euroToUsd;

    this.converterForm.patchValue({ initialValue: this.convertedValue.toFixed(5) });
    this.updateConvertedValue();
  }

  ngOnDestroy(): void {
    this.stopPolling.next();
  }
}
