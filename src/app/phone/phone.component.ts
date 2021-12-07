import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn} from '@angular/forms';
import PhoneNumber from 'awesome-phonenumber';
import {ISO_3166_1_CODES} from './country-codes';
import {ErrorStateMatcher} from '@angular/material/core';

@Component({
    selector: 'app-phone',
    templateUrl: './phone.component.html',
    styles: [`
      .phone_number {
        padding-left: 1em;
      }
    `]
})
export class PhoneComponent {

    countyCodes = ISO_3166_1_CODES;
    profileForm = this.fb.group({
        phone: this.fb.group({
            country: ['US'],
            number: ['']
        }, {validators: phoneValidator})
    });
    phoneErrorMatcher = new PhoneErrorMatcher();

    constructor(
        private fb: FormBuilder
    ) {
    }

    get phoneGroup() {
        return this.profileForm.get('phone') as FormControl;
    }

    get phoneCountryControl() {
        return this.profileForm.get('phone.country') as FormControl;
    }

    get phoneNumberControl() {
        return this.profileForm.get('phone.number') as FormControl;
    }

    get phoneNumberDigits(): string {
        return this.phoneNumberControl.value.replace(/\D/g, '');
    }

    get phoneNumber(): PhoneNumber {
        return new PhoneNumber(this.phoneNumberDigits, this.phoneCountryControl.value);
    }

    get phoneHint(): string {
        return PhoneNumber.getExample(this.phoneCountryControl.value).getNumber('national');
    }

    get phoneE164(): string {
        return this.phoneNumber.getNumber('e164');
    }

    formatNumber() {
        const natNum = this.phoneNumber.getNumber('national');
        this.phoneNumberControl.setValue((natNum) ? natNum : this.phoneNumberDigits);
    }
}

export const phoneValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const num = control.get('number');
    const country = control.get('country');
    if (num?.value && country?.value && !(new PhoneNumber(num.value, country.value).isValid())) {
        return {invalidPhone: true};
    } else {
        return null;
    }
};

export class PhoneErrorMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control.value && control.touched && !control?.parent?.valid);
    }
}
