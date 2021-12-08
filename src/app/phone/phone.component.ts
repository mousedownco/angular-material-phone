import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn} from '@angular/forms';
import PhoneNumber from 'awesome-phonenumber';
import {ISO_3166_1_CODES} from './country-codes';
import {ErrorStateMatcher} from '@angular/material/core';

/**
 * The PhoneComponent presents a country selector and phone number
 * field that formats the phone number according to the selected
 * country's number standard.  The available awesome-phonenumber
 * metadata are presented as the phone number is entered.
 */
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


    /**
     * Return a string containing only numeric values from the
     * phone.number form field.
     */
    get phoneNumberDigits(): string {
        return this.phoneNumberControl.value.replace(/\D/g, '');
    }

    /**
     * Return an {@see PhoneNumber} value created from the
     * phoneNumberDigits and currently selected country code.
     */
    get phoneNumber(): PhoneNumber {
        return new PhoneNumber(this.phoneNumberDigits, this.phoneCountryControl.value);
    }

    /**
     * Formats the phone number digits using the 'national' format
     * from awesome-phonenumber.
     */
    formatNumber() {
        const natNum = this.phoneNumber.getNumber('national');
        this.phoneNumberControl.setValue((natNum) ? natNum : this.phoneNumberDigits);
    }

    /**
     * Generate a hint using the {@see PhoneNumber} getExample method
     * with the currently selected country.
     */
    get phoneHint(): string {
        return PhoneNumber.getExample(this.phoneCountryControl.value).getNumber('national');
    }

    /**
     * Get the [E.164]{@link https://en.wikipedia.org/wiki/E.164} formatted
     * phone number typically required by systems for making calls and
     * sending text messages.
     */
    get phoneE164(): string {
        return this.phoneNumber.getNumber('e164');
    }

    // FormControl Getters
    get phoneGroup() {
        return this.profileForm.get('phone') as FormControl;
    }

    get phoneCountryControl() {
        return this.profileForm.get('phone.country') as FormControl;
    }

    get phoneNumberControl() {
        return this.profileForm.get('phone.number') as FormControl;
    }
}

/**
 * Validates a FormGroup containing `country` and `number` fields that
 * are used to generate a {@see PhoneNumber}. Valid numbers are
 * determined by the PhoneNumber.isValid() method.
 */
export const phoneValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const country = control.get('country');
    const num = control.get('number');
    if (num?.value && country?.value && !(new PhoneNumber(num.value, country.value).isValid())) {
        return {invalidPhone: true};
    } else {
        return null;
    }
};

/**
 * {@see ErrorStateMatcher} used to update the error state of the
 * phone number when the country or phone number changes.
 */
export class PhoneErrorMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control.value && control.touched && !control?.parent?.valid);
    }
}
