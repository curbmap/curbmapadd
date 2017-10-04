import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators } from '@angular/forms';

export function hasSpecial(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
        const name = control.value;
        const regEx = RegExp(".*[\\~\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\-\\=\\+\\<\\>\\?].*");
        return !regEx.test(name) ? {'hasSpecial': {name}} : null;
    }
}

@Directive({
    selector: '[hasSpecial]',
    providers: [{provide: NG_VALIDATORS, useExisting: HasSpecialDirective, multi: true}]
})
export class HasSpecialDirective implements Validator, OnChanges {
    @Input() hasSpecialName: string;
    private valFn = Validators.nullValidator;

    ngOnChanges(changes: SimpleChanges): void {
        const change = changes['hasSpecial'];
        if (change) {
            this.valFn = hasSpecial();
        } else {
            this.valFn = Validators.nullValidator;
        }
    }

    validate(control: AbstractControl): {[key: string]: any} {
        return this.valFn(control);
    }
}


export function hasNumber(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
        const name = control.value;
        const regEx = RegExp(".*[0-9].*");
        return !regEx.test(name) ? {'hasNumber': {name}} : null;
    }
}

@Directive({
    selector: '[hasNumber]',
    providers: [{provide: NG_VALIDATORS, useExisting: HasNumberDirective, multi: true}]
})
export class HasNumberDirective implements Validator, OnChanges {
    @Input() hasNumberName: string;
    private valFn = Validators.nullValidator;

    ngOnChanges(changes: SimpleChanges): void {
        const change = changes['hasNumber'];
        if (change) {
            this.valFn = hasNumber();
        } else {
            this.valFn = Validators.nullValidator;
        }
    }

    validate(control: AbstractControl): {[key: string]: any} {
        return this.valFn(control);
    }
}

export function hasCapital(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
        const name = control.value;
        const regEx = RegExp(".*[A-Z].*");
        return !regEx.test(name) ? {'hasCapital': {name}} : null;
    }
}

@Directive({
    selector: '[hasCapital]',
    providers: [{provide: NG_VALIDATORS, useExisting: HasCapitalDirective, multi: true}]
})
export class HasCapitalDirective implements Validator, OnChanges {
    @Input() hasCapitalName: string;
    private valFn = Validators.nullValidator;

    ngOnChanges(changes: SimpleChanges): void {
        const change = changes['hasCapital'];
        if (change) {
            this.valFn = hasCapital();
        } else {
            this.valFn = Validators.nullValidator;
        }
    }

    validate(control: AbstractControl): {[key: string]: any} {
        return this.valFn(control);
    }
}


export function hasLowercase(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
        const name = control.value;
        const regEx = RegExp(".*[a-z].*");
        return !regEx.test(name) ? {'hasLowercase': {name}} : null;
    }
}

@Directive({
    selector: '[hasLowercase]',
    providers: [{provide: NG_VALIDATORS, useExisting: HasLowercaseDirective, multi: true}]
})
export class HasLowercaseDirective implements Validator, OnChanges {
    @Input() hasLowercaseName: string;
    private valFn = Validators.nullValidator;

    ngOnChanges(changes: SimpleChanges): void {
        const change = changes['hasLowercase'];
        if (change) {
            this.valFn = hasLowercase();
        } else {
            this.valFn = Validators.nullValidator;
        }
    }

    validate(control: AbstractControl): {[key: string]: any} {
        return this.valFn(control);
    }
}
