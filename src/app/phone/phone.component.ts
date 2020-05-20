import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn} from '@angular/forms';
import PhoneNumber from 'awesome-phonenumber';
import {ISO_3166_1_CODES} from './country-codes';
import {ErrorStateMatcher} from '@angular/material/core';

@Component({
    selector: 'app-phone',
    templateUrl: './phone.component.html',
    styleUrls: ['./phone.component.scss']
})
export class PhoneComponent {

    countyCodes = ISO_3166_1_CODES;
    profileForm = this.fb.group({
        phone: this.fb.group({
            region: ['US'],
            number: ['']
        }, {validators: phoneValidator})
    });
    phoneErrorMatcher = new PhoneErrorMatcher();

    constructor(
        private fb: FormBuilder
    ) {
    }

    get phone() {
        return this.profileForm.get('phone') as FormControl;
    }

    get phoneRegion() {
        return this.profileForm.get('phone.region') as FormControl;
    }

    get phoneNumber() {
        return this.profileForm.get('phone.number') as FormControl;
    }

    get phoneNumberDigits(): string {
        return this.phoneNumber.value.replace(/\D/g, '');
    }

    get regionalPhoneNumber(): PhoneNumber {
        return new PhoneNumber(this.phoneNumberDigits, this.phoneRegion.value);
    }

    get phoneHint(): string {
        return PhoneNumber.getExample(this.phoneRegion.value).getNumber('national');
    }

    get phoneE164(): string {
        return this.regionalPhoneNumber.getNumber('e164');
    }

    formatNumber() {
        const natNum = this.regionalPhoneNumber.getNumber('national');
        this.phoneNumber.setValue((natNum) ? natNum : this.phoneNumberDigits);
    }
}

export const phoneValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const num = control.get('number');
    const region = control.get('region');
    return num?.value && region?.value && !(new PhoneNumber(num.value, region.value).isValid()) ? {invalidPhone: true} : null;
};

export class PhoneErrorMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control.value && control.touched && !control?.parent?.valid);
    }
}
