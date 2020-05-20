import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PhoneComponent, PhoneErrorMatcher, phoneValidator} from './phone.component';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ISO_3166_1_CODES} from './country-codes';

describe('PhoneComponent', () => {
    let component: PhoneComponent;
    let fixture: ComponentFixture<PhoneComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PhoneComponent],
            providers: [FormBuilder],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PhoneComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    test('initialization', () => {
        expect(component).toBeTruthy();
        expect(component.phoneCountryControl.value).toEqual('US');
    });

    for (const countryCode of ISO_3166_1_CODES) {
        test(`phoneHint(${countryCode.code}) is not empty`, () => {
            component.phoneCountryControl.setValue(countryCode.code);
            expect(component.phoneHint).toBeTruthy();
        });
    }

    test('#phoneE164()', () => {
        const input = '(301) 555-1212';
        const expected = '+13015551212';
        component.phoneCountryControl.setValue('US');
        component.phoneNumberControl.setValue(input);
        expect(component.phoneGroup.valid).toEqual(true);
        expect(component.phoneE164).toEqual(expected);
    });
});

describe('phoneValidator', () => {
    test('null number control', () => {
        const group = new FormGroup({
            country: new FormControl()
        });
        expect(phoneValidator(group)).toBeNull();
    });

    test('null country control', () => {
        const group = new FormGroup({
            number: new FormControl()
        });
        expect(phoneValidator(group)).toBeNull();
    });

    describe('ValidationErrors', () => {
        const testData = [
            ['4155551212', 'US', true],
            ['415-555-1212', 'US', true],
            ['(415) 555-1212', 'US', true],
            ['415 555 1212', 'US', true],
            ['415.555.1212', 'US', true],
            ['+14155551212', 'US', true],
            ['415555121', 'US', false],
            ['914155551212', 'MX', false],
        ];
        for (const data of testData) {
            test(`${data[0]} in ${data[1]} is ${(data[2]) ? '' : 'NOT'} valid`, () => {
                const group = new FormGroup({
                    number: new FormControl(data[0]),
                    country: new FormControl(data[1])
                });
                expect(phoneValidator(group) == null).toBe(data[2]);
            });
        }
    });
});

describe('PhoneErrorMatcher', () => {
    const fb = new FormBuilder();
    const phoneErrorMatcher = new PhoneErrorMatcher();
    let phoneForm: FormGroup;
    let phoneNumber: FormControl;
    let phoneCountry: FormControl;
    beforeEach(() => {
        phoneForm = fb.group({
            phone: fb.group({
                    country: ['US'],
                    number: ['']
                },
                {validators: phoneValidator})
        });
        phoneNumber = phoneForm.get('phone.number') as FormControl;
        phoneCountry = phoneForm.get('phone.country') as FormControl;
    });

    test('isErrorState (untouched)', () => {
        expect(phoneErrorMatcher.isErrorState(phoneNumber, null)).toEqual(false);
    });

    test('isErrorState (empty and touched)', () => {
        phoneNumber.markAsTouched();
        expect(phoneErrorMatcher.isErrorState(phoneNumber, null)).toEqual(false);
    });

    test('isErrorState (invalid and touched)', () => {
        phoneNumber.markAsTouched();
        phoneNumber.setValue('123');
        expect(phoneErrorMatcher.isErrorState(phoneNumber, null)).toEqual(true);
    });

    test('isErrorState (valid and touched)', () => {
        phoneNumber.markAsTouched();
        phoneNumber.setValue('4155551212');
        expect(phoneErrorMatcher.isErrorState(phoneNumber, null)).toEqual(false);
    });
});


