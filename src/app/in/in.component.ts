import { AfterViewInit, Component, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { NavInformation } from '../shared/nav-information.service';
import { AgmMap } from '@agm/core';
import { Http } from '@angular/http';
import { sendGet, sendPost } from '../shared/http.resources';
import { Router } from '@angular/router';
import { UserInformation } from '../shared/user-information.service';
import { Line, Marker, Restriction } from '../shared/types';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

// import {MapTypeId} from '@agm/core/services/google-maps-types';

// let frontend: string = location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://curbmap.com:443';
let backend: string = location.hostname === 'localhost' ? 'http://localhost:8081' : 'https://curbmap.com:50003';

@Component({
    selector: 'my-in',
    templateUrl: './in.component.html',
    styleUrls: ['./in.component.scss']
})
export class InComponent implements AfterViewInit {
    backend = location.hostname === 'localhost' ? 'http://localhost:8081' : 'https://curbmap.com:50003';
    mapTopLeft = {lat: 34.040106800289944, lng: -118.23687258038635};
    center = {lat: 34.040106800289944, lng: -118.23687258038635};
    zoom = 18;
    polylines = [];
    markers: Marker[] = [];
    @ViewChild('map') map: AgmMap;
    @ViewChild('submitButton') submitButton: ElementRef;
    help: any = null;
    addInfo: any = null;
    getInfo: any = null;
    getInfoContent: any = null;
    marker1 = {point: {lat: 0, lng: 0}};
    marker2 = {point: {lat: 0, lng: 0}};
    timer: any;
    submitPreventDisabled = false;
    // image = null;
    addInfoForm: FormGroup;
    sizeLimit = 3000000;
    mapTypeIdx = 0;
    mapType = {value: 'roadmap', string: 'street'};
    mapTypes = [{value: 'roadmap', string: 'street' },
        { value: 'satellite', string: 'satellite' },
        { value: 'hybrid', string: 'both'}];
    restrSelector = [
        {'value': '', 'print': 'Select a restriction'},
        {'value': 'rednp', 'print': 'Red Zone-No Parking'},
        {'value': 'redns', 'print': 'Red Zone-No Stopping'}
    ];
    centerMarker: Marker = null;
    all_day = true;
    hasTimeLimit = false;
    hasCost = false;
    markerToSet: Marker = null;
    markerInfo: Marker = null;
    lineToSet: Line = null;
    addPoint = true;
    isPoint = true;
    public angle = '0';
    allClicked = true;
    centerMarkerIsOpen = true;
    outputDays = InComponent.outputDays;
    outputFullName = InComponent.outputFullName;
    minutesToMilitary = InComponent.minutesToMilitary;
    degreesToType = InComponent.degreesToType;
    public addRestrModal: BsModalRef;
    public reviewRestrModal: BsModalRef;
    public modalConfig = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    public static epsilon = 1e-5;
    public static colorFromRestr(restrs: Restriction[]): any[] {
        let color = 'black';
        let opacity = 0.5;
        for (let restr of restrs) {
            switch (restr.type) {
                case 'hyd':
                case 'redns':
                case 'rednp':
                    color = 'red';
                    opacity = (restr.upVotes + InComponent.epsilon) /
                        (restr.upVotes + restr.downVotes + InComponent.epsilon);
                    break;
                case 'sweep':
                    if (color !== 'red') {
                        color = 'purple';
                        opacity = (restr.upVotes + InComponent.epsilon) /
                            (restr.upVotes + restr.downVotes + InComponent.epsilon);
                    }
                    break;
                case 'dis':
                    if (color !== 'red') {
                        color = 'blue';
                        opacity = (restr.upVotes + InComponent.epsilon) /
                            (restr.upVotes + restr.downVotes + InComponent.epsilon);
                    }
                    break;
                case 'com':
                case 'yel':
                    if (color !== 'red') {
                        color = 'yellow';
                        opacity = (restr.upVotes + InComponent.epsilon) /
                            (restr.upVotes + restr.downVotes + InComponent.epsilon);
                    }
                    break;
                case 'whi':
                    if (color !== 'red') {
                        color = 'white';
                        opacity = (restr.upVotes + InComponent.epsilon) /
                            (restr.upVotes + restr.downVotes + InComponent.epsilon);
                    }
                    break;
                case 'met':
                    if (color !== 'red') {
                        color = 'magenta';
                        opacity = (restr.upVotes + InComponent.epsilon) /
                            (restr.upVotes + restr.downVotes + InComponent.epsilon);
                    }
                    break;
                case 'gre':
                    if (color !== 'red') {
                        color = 'green';
                        opacity = (restr.upVotes + InComponent.epsilon) /
                            (restr.upVotes + restr.downVotes + InComponent.epsilon);
                    }
                    break;
                case 'ppd':
                    if (color !== 'red') {
                        color = 'brown';
                        opacity = (restr.upVotes + InComponent.epsilon) /
                            (restr.upVotes + restr.downVotes + InComponent.epsilon);
                    }
                    break;
                case 'tim':
                    if (color !== 'red') {
                        color = 'gray';
                        opacity = (restr.upVotes + InComponent.epsilon) /
                            (restr.upVotes + restr.downVotes + InComponent.epsilon);
                    }
                    break;

                default:
                    break;
            }
        }
        return [color, opacity];
    }
    public static makeTwoDigit(intValue) {
        if (intValue < 10) {
            return '0' + intValue;
        } else {
            return '' + intValue;
        }
    }
    public static daysFromString(days: string): boolean[] {
        let daysArray = days.split('');
        let daysBoolArray: boolean[] = [];
        for (let day of daysArray) {
            if (day === '1') {
                daysBoolArray.push(true);
            } else {
                daysBoolArray.push(false);
            }
        }
        return daysBoolArray;
    }

    // restrictions come in as arrays of arrays of 10 any-type items.
    // 0 = id
    // 1 = type
    // 2 = startTime (minutes from 0000)
    // 3 = endTime (minutes from 0000
    // 4 = days a 7 character string of 1s and 0s.
    // 5 = angle rotation from parallel
    // 6 = updated on (timestamp utc)
    // 6 = upVotes
    // 7 = downVotes
    // 8 = timeLimit (minutes)
    // 9 = cost (dollars or portion thereof)
    // 10 = per (minutes)

    public static restrFromArray(restrArray: Array< Array<any> >): Restriction[] {
        let arrayOfRestr: Restriction[] = [];
        if (restrArray === null || restrArray === undefined) {
            return [];
        }
        for (let restr of restrArray) {
            if (restr === null || restr.length !== 12) {
                continue;
            }
            let singleRestr: Restriction = {
                id: restr[0],
                type: restr[1],
                startTime: restr[2],
                endTime: restr[3],
                days: restr[4],
                angle: restr[5],
                voted: 0,
                modified: 0,
                updated: restr[6],
                upVotes: restr[7],
                downVotes: restr[8],
                color: InComponent.colorFromRestr(restr[1])[0]
            };
            if (restr[1] === 'tim' || restr[1] === 'met') {
                singleRestr.timeLimit = restr[9];
                if (restr[1] === 'met') {
                    singleRestr.cost = restr[10];
                    singleRestr.per = restr[11];
                }
            }
            arrayOfRestr.push(singleRestr);
        }
        return arrayOfRestr;
    }
    public static outputFullName(name: string) {
        let names = {
            'rednp': 'Red zone, no-parking',
            'redns': 'Red zone, no-stopping',
            'hyd': 'Hydrant, no parking',
            'gre': 'Green zone, time limit',
            'whi': 'White zone, passenger loading',
            'com': 'Loading zone',
            'yel': 'Yellow zone',
            'met': 'Metered',
            'ppd': 'Preferential Parking'
        };
        return names[name];
    }

    /*
     *  Date conversion functions
     */

    public static outputDays(days: string) {
        let daysArrayNames = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
        let daysPresent = [];
        let allDays = true;
        for (let i = 0; i < days.length; i++) {
            if (days[i]) {
                daysPresent.push(daysArrayNames[i]);
            }
            else {
                allDays = false;
            }
        }
        if (allDays) {
            return 'all days';
        } else {
            return daysPresent.join(', ');
        }
    }

    public static minutesToMilitary(minutes: number): string {
        let hrs = Math.floor((minutes / 60));
        let min = Math.floor((minutes % 60));
        return InComponent.makeTwoDigit(hrs) + ':' + InComponent.makeTwoDigit(min);
    }

    public static dateToMinutes(date: Date): number {
        let hrs = date.getHours();
        let min = date.getMinutes();
        return ((hrs * 60) + min);
    }

    public static degreesToType(deg: number): string {
        let degList = [0, 45, 90];
        let nameList = ['parallel', 'angled', 'head in'];
        let idx = degList.indexOf(deg);
        if (idx >= 0) {
            return nameList[idx];
        }
        return null;
    }

    constructor(private navInformation: NavInformation,
                private http: Http,
                private router: Router,
                private fb: FormBuilder,
                private userInformation: UserInformation,
                private modalService: BsModalService
    ) {
        this.createForm();
        this.addInfoForm.valueChanges.subscribe(data => this.onValueChanged(data));
        if (this.userInformation.getSESSION() === '') {
            this.router.navigate(['/'], {skipLocationChange: true});
        }
        this.navInformation.setNavLinks('LoggedIn');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.gotPosition.bind(this));
        }
        // // Get access to the camera!
        // if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        //     // Not adding `{ audio: true }` since we only want video now
        //     navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        //         console.log(stream);
        //     });
        // }
    }

    upVote(restr: Restriction) {
        for (let restriction of this.markerToSet.restriction) {
            if (restriction.id === restr.id) {
                if (this.userInformation.getUsername() !== 'curbmaptest' && this.userInformation.getUsername() !== undefined) {
                    let headers = {
                        'Session': this.userInformation.getSESSION(),
                        'username': this.userInformation.getUsername()
                    };
                    let body = {
                        'point':  this.isPoint ? this.markerToSet.lineId : undefined,
                        'line': this.isPoint ? undefined : this.lineToSet.id,
                        'restrictionId': restr.id,
                        'upVotes': 1,
                    };
                    let url = backend + '/upVote';
                    sendPost(this.http, headers, JSON.stringify(body),
                        url, this.handleDataVote.bind(this),
                        this.handleErrorVote.bind(this)).subscribe((result) => {
                        console.log(result);
                    });
                }
            }
        }
    }

    downVote(restr: Restriction) {
        for (let restriction of this.markerToSet.restriction) {
            if (restriction.id === restr.id) {
                if (this.userInformation.getUsername() !== 'curbmaptest' && this.userInformation.getUsername() !== undefined) {
                    let headers = {
                        'Session': this.userInformation.getSESSION(),
                        'username': this.userInformation.getUsername()
                    };
                    let body = {
                        'point':  this.isPoint ? this.markerToSet.lineId : undefined,
                        'line': this.isPoint ? undefined : this.lineToSet.id,
                        'restrictionId': restr.id,
                        'downVotes': 1,
                    };
                    let url = backend + '/downVote';
                    sendPost(this.http, headers, JSON.stringify(body),
                        url, this.handleDataVote.bind(this),
                        this.handleErrorVote.bind(this)).subscribe((result) => {
                        console.log(result);
                    });
                }
            }
        }
    }

    handleDataVote(res: Response) {
        console.log(res);
        return [true];
    }

    handleErrorVote(err: Response) {
        if (err.status === 404) {
            console.log('User curbmaptest cannot vote');
        }
        return [false];
    }

    delete(restr: Restriction) {
        let i = 0;
        for (let restrict of this.markerToSet.restriction) {
            if (restrict === restr || restrict.id === restr.id) {
                this.markerToSet.restriction.splice(i, 1);
            }
            i++;
        }
        console.log('delete:' + restr);
    }
    createForm() {
        this.addInfoForm = this.fb.group({
            startTime: new Date(),
            endTime: new Date(),
            restr: '',
            cost: '',
            per: '',
            timeLimit: '',
            su: true,
            mo: true,
            tu: true,
            we: true,
            th: true,
            fr: true,
            sa: true,
            all_day: true
        });
        this.resetForm();

    }
    onValueChanged(data: any){
        if (data['restr'] === 'time' || data['restr'] === 'timeCost') {
            this.hasTimeLimit = true;
        } else {
            this.hasTimeLimit = false;
        }
        if (data['restr'] === 'timeCost') {
            this.hasCost = true;
        } else {
            this.hasCost = false;
        }
        if (data['all_day']) {
            this.all_day = true;
            $('#allday').removeClass('btn-default').addClass('btn-danger');
        } else {
            this.all_day = false;
            $('#allday').addClass('btn-default').removeClass('btn-danger');
        }
        if (data['su']) {
            $('#su').removeClass('btn-default').addClass('btn-danger');
        } else if (!data['su']) {
            $('#su').addClass('btn-default').removeClass('btn-danger');
        }
        if (data['mo']) {
            $('#mo').removeClass('btn-default').addClass('btn-danger');
        } else if (!data['mo']) {
            $('#mo').addClass('btn-default').removeClass('btn-danger');
        }
        if (data['tu']) {
            $('#tu').removeClass('btn-default').addClass('btn-danger');
        } else if (!data['tu']) {
            $('#tu').addClass('btn-default').removeClass('btn-danger');
        }
        if (data['we']) {
            $('#we').removeClass('btn-default').addClass('btn-danger');
        } else if (!data['we']) {
            $('#we').addClass('btn-default').removeClass('btn-danger');
        }
        if (data['th']) {
            $('#th').removeClass('btn-default').addClass('btn-danger');
        } else if (!data['th']) {
            $('#th').addClass('btn-default').removeClass('btn-danger');
        }
        if (data['fr']) {
            $('#fr').removeClass('btn-default').addClass('btn-danger');
        } else if (!data['fr']) {
            $('#fr').addClass('btn-default').removeClass('btn-danger');
        }
        if (data['sa']) {
            $('#sa').removeClass('btn-default').addClass('btn-danger');
        } else if (!data['sa']) {
            $('#sa').addClass('btn-default').removeClass('btn-danger');
        }
    }

    showAddRestrModal(template: TemplateRef<any>) {
        this.addRestrModal = this.modalService.show(template, this.modalConfig);
    }

    closeAddRestrModal(template: TemplateRef<any>) {
        this.addRestrModal.hide();
        this.addRestrModal = null;
        if (this.markerToSet.restriction.length !== 0) {
            this.reviewRestrModal = this.modalService.show(template, this.modalConfig);
        }
    }

    nextAddRestrModal(template: TemplateRef<any>) {
        if (this.addInfoForm.value['restr'] === '') {
            return;
        }
        if ((this.addInfoForm.value['restr'] === 'lim' ||
                this.addInfoForm.value['restr'] === 'met') &&
            this.addInfoForm.value['timeLimit'] === '') {
            return;
        }
        if (this.addInfoForm.value['restr'] === 'met' &&
            (this.addInfoForm.value['cost'] === '' ||
                this.addInfoForm.value['per'] === '')) {
            return;
        }
        // Only hide if information is correct
        this.addRestrModal.hide();

        let timeStart, timeEnd;
        if (this.all_day) {
            timeStart = 0;
            timeEnd = 1440;
        } else {
            timeStart = InComponent.dateToMinutes(this.addInfoForm.value['startTime']);
            timeEnd = InComponent.dateToMinutes(this.addInfoForm.value['endTime']);
        }
        let restr: Restriction = {
            type: this.addInfoForm.value['restr'],
            startTime: timeStart,
            endTime: timeEnd,
            angle: parseInt(this.angle),
            days: [this.addInfoForm.value['su'],
                this.addInfoForm.value['mo'],
                this.addInfoForm.value['tu'],
                this.addInfoForm.value['we'],
                this.addInfoForm.value['th'],
                this.addInfoForm.value['fr'],
                this.addInfoForm.value['sa']],
            updated: new Date().getTime(),
            voted: 0,
            modified: -1
        };
        console.log(restr);
        restr['color'] = InComponent.colorFromRestr([restr])[0];

        if (this.addInfoForm.value['restr'] === 'time' || this.addInfoForm.value['restr'] === 'timeCost') {
            restr['timeLimit'] = this.addInfoForm.value['limit'];
            if (this.addInfoForm.value['restr'] === 'timeCost') {
                restr['cost'] = this.addInfoForm.value['cost'];
                restr['per'] = this.addInfoForm.value['per'];
            }
        }
        this.markerToSet['restriction'].push(restr);
        // push the restriction onto the marker and view the
        this.reviewRestrModal = this.modalService.show(template, this.modalConfig);
    }

    moreRules(template: TemplateRef<any>) {
        this.reviewRestrModal.hide();
        this.reviewRestrModal = null;
        this.resetForm();
        this.addRestrModal = this.modalService.show(template, this.modalConfig);
    }

    doneWithRules() {
        this.reviewRestrModal.hide();
        this.reviewRestrModal = null;
        this.resetForm();
        if (this.isPoint) {
            if (this.markerToSet.restriction.length >= 1) {
                this.submitPoint();
            }
        } else {
            // submit line!
        }
    }

    closeReviewRestrModal() {
        this.reviewRestrModal.hide();
        this.reviewRestrModal = null;
    }

    clickAllDays() {
        this.allClicked = !this.allClicked;
        if (!this.allClicked) {
            $('#alldays').removeClass('btn-default');
            $('#alldays').addClass('btn-danger');
            this.addInfoForm.patchValue({
                su: false,
                mo: false,
                tu: false,
                we: false,
                th: false,
                fr: false,
                sa: false
            });
        } else {
            $('#alldays').addClass('btn-default');
            $('#alldays').removeClass('btn-danger');
            this.addInfoForm.patchValue({
                su: true,
                mo: true,
                tu: true,
                we: true,
                th: true,
                fr: true,
                sa: true
            });
        }
        if (!this.allClicked) {
            $('#alldays').prop('value', 'Select all days');
        } else {
            $('#alldays').prop('value', 'Deselect all days');
        }
    }
    clickMainMarker(template: TemplateRef<any>) {
        this.centerMarkerIsOpen = false;
        this.markerToSet = this.centerMarker;
        console.log(this.markerToSet);
        this.resetForm();
        this.showAddRestrModal(template);
    }

    changeMapType() {
        this.mapTypeIdx++;
        if (this.mapTypeIdx > this.mapTypes.length - 1) {
            this.mapTypeIdx = 0;
        }
        this.mapType = this.mapTypes[this.mapTypeIdx];
    }

    disableSendButton($event: any) {
        console.log('disable event: ' + $event);
        if (this.submitPreventDisabled !== true) {
            this.submitButton.nativeElement.disabled = true;
        }
        this.submitPreventDisabled = false;
    }

    imageRemoved($event: any) {
        console.log('image removed');
        console.log('event: ' + $event);
        this.submitPreventDisabled = true;
        this.submitButton.nativeElement.disabled = false;
    }

    imageUploaded($event: any) {
        console.log('image uploaded');
        console.log('event: ' + $event);
        this.submitPreventDisabled = true;
        this.submitButton.nativeElement.disabled = false;
    }

    resetForm() {
        this.hasTimeLimit = true;
        this.all_day = true;
        this.hasCost = true;
        this.angle = '0';
        this.addInfoForm.patchValue({
            restr: '',
            timeLimit: '',
            cost: '',
            per: '',
            su: true,
            mo: true,
            tu: true,
            we: true,
            th: true,
            fr: true,
            sa: true,
            startTime: new Date(),
            endTime: new Date(),
            all_day: true
        });
        this.allClicked = true;
    }

    boundsChanged(data: any) {
        this.marker1.point.lng = data.b.b;
        this.marker1.point.lat = data.f.b;
        this.marker2.point.lng = data.b.f;
        this.marker2.point.lat = data.f.f;
    }

    ngAfterViewInit() {
        this.recenter();
    }

    recenter() {
        navigator.geolocation.getCurrentPosition(this.gotPosition.bind(this));
    }

    showHelp() {
        this.help.modal('show');
    }

    gotPosition(data: any) {
        this.mapTopLeft.lat = data.coords.latitude;
        this.mapTopLeft.lng = data.coords.longitude;
        setTimeout(() => {
            this.map.triggerResize().then((fulfilled) => {
                console.log(fulfilled);
            });
        }, 400);
    }

    enteredIdle() {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.getLines.bind(this), 10);
    }

    getLines() {
        console.log('XXX');
        let headers = {
            'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
            'Authorization': ' Bearer ' + this.userInformation.getToken(),
            'session': this.userInformation.getSESSION(),
            'Access-Control-Allow-Origin': '*',
            'username': 'curbmapuser'
        };
        // @11 = 1546m radius
        // @21 = 395m radius
        // let extent = this.map.zoom > 11 ? Math.exp(-1*this.map.zoom/17)*(25/(Math.pow(this.map.zoom,1.2)))*3800 : 0;
        if (this.map.zoom > 11 && this.map.zoom < 21) {
            const url = backend + '/areaPolygon' +
                '?lat1=' + this.marker1.point.lat +
                '&lng1=' + this.marker1.point.lng +
                '&lat2=' + this.marker2.point.lat +
                '&lng2=' + this.marker2.point.lng +
                '&user=' + this.userInformation.getUsername()
            ;
            sendGet(this.http,
                headers,
                url,
                this.gotData.bind(this),
                this.gotError.bind(this)).subscribe(
                result => {
                    this.polylines = [];
                    this.markers = [];
                    if (result !== []) {
                        for (let resultLine of result) {
                            let lineHolder = {line: [], color: 'black', restrs: [], weight: 0.5, opacity: 0.7};
                            resultLine['coordinates'].forEach((linePoint) => {
                                lineHolder.line.push({lat: linePoint[1], lng: linePoint[0]});
                            });
                            if (resultLine['restrs'] !== null && resultLine['restrs'] !== undefined) {
                                lineHolder.restrs = InComponent.restrFromArray(resultLine['restrs']);

                                let colOp = InComponent.colorFromRestr(lineHolder.restrs);
                                lineHolder.color = colOp[0];
                                lineHolder.weight = 2;
                                lineHolder.opacity = colOp[1];
                            }
                            for (let pointIdx in resultLine['multiPointProperties']['points']) {
                                if (resultLine['multiPointProperties']['points'].hasOwnProperty(pointIdx)) {
                                    let restr: Restriction[] = InComponent.restrFromArray(
                                        resultLine['multiPointProperties']['restrs'][pointIdx]);
                                    let colOp = InComponent.colorFromRestr(restr);
                                    let markerHolder: Marker = {
                                        point: {
                                            lng: resultLine['multiPointProperties']['points'][pointIdx][0],
                                            lat: resultLine['multiPointProperties']['points'][pointIdx][1]
                                        },
                                        url: 'img/' + colOp[0] + '.png',
                                        opacity: parseFloat(colOp[1]),
                                        draggable: false,
                                        restriction: restr,
                                        lineId: resultLine['key'],
                                        id: resultLine['multiPointProperties']['ids'][pointIdx]
                                    };
                                    this.markers.push(markerHolder);
                                }
                            }
                            this.polylines.push(lineHolder);
                        }
                    }
                },
                error => {
                    console.log('ERROR' + error);
                }
            );
        }
    }

    submitPoint() {
        let headers = {
            'session': this.userInformation.getSESSION(),
            'username': this.userInformation.getUsername(),
            'Content-Type': 'application/json',
        };
        if (this.markerToSet.id === undefined) {
            let url = this.backend + '/addPoint';
            sendPost(this.http, headers,
                JSON.stringify(this.markerToSet), url,
                this.getResultAdd.bind(this), this.handleError.bind(this)).subscribe(_ => {
                if (this.addPoint === true) {
                    console.log(this.markerToSet);
                    this.markerToSet['url'] = 'img/' + InComponent.colorFromRestr(this.markerToSet.restriction)[0] + '.png';
                    this.markers.push(this.markerToSet);
                    this.addPoint = false;
                }
            });
        } else {
            let restrToSend = [];
            console.log()
            for (let restr of this.markerToSet.restriction) {
                if (restr.modified !== 0) {
                    restrToSend.push(restr);
                }
            }
            if (restrToSend.length > 0) {
                let url = this.backend + '/addPointRestr';
                let body = {
                    point_id: this.markerToSet.id,
                    lineId: this.markerToSet.lineId,
                    point: this.markerToSet.point,
                    restrs: restrToSend
                };
                sendPost(this.http, headers,
                    JSON.stringify(body), url,
                    this.getResultAddPointRestr.bind(this), this.handleError.bind(this)).subscribe(addrestr => {
                    if (addrestr === true) {
                        // will have sent back all the new rules and we would have set them in the
                        // getResultAddRestr already
                    }
                });
            }
        }
    }

    makeDays() {
        let days = [this.addInfoForm.value['su'] ? 1 : 0,
            this.addInfoForm.value['mo'] ? 1 : 0,
            this.addInfoForm.value['tu'] ? 1 : 0,
            this.addInfoForm.value['we'] ? 1 : 0,
            this.addInfoForm.value['th'] ? 1 : 0,
            this.addInfoForm.value['fr'] ? 1 : 0,
            this.addInfoForm.value['sa'] ? 1 : 0];
        return days.join('');
    }
    getResultAdd(res: Response) {
        let jsonResponse = res.json();
        if (jsonResponse['success'] === true) {
            this.addPoint = true;
            return [true];
        } else {
            this.addPoint = false;
            return [];
        }
    }
    getResultAddPointRestr(res: Response) {
        let jsonResponse = res.json();
        if (jsonResponse['success'] === true) {
            for (let restr of this.markerToSet.restriction) {
                if (restr.id === undefined) {
                    let temp = InComponent.restrFromArray([jsonResponse['rules'][restr.updated]])[0];
                    restr = temp;
                }
            }
            return [true];
        } else {
            return [];
        }
    }
    handleError(err: Response) {
        console.log('error: ' + err);
        this.addPoint = false;
        return [];
    }
    centerChanged(event: any) {
        this.center = event;
        this.centerMarker = {
            point: {
                lng: this.center.lng,
                lat: this.center.lat
            },
            opacity: 1.0,
            draggable: false,
            url: 'img/center.png',
            restriction: [],
            info: 'Click here to set a restriction'
        };
    }
    clickOtherMarker(markerClicked: Marker, template: TemplateRef<any>) {
        this.markerToSet = markerClicked;
        console.log(markerClicked);
        this.reviewRestrModal = this.modalService.show(template, this.modalConfig);
    }
    doubleClicked(event: any) {
        this.addMarker(event.coords);
    }
    addMarker(coords: any) {
        this.resetForm();
        this.markerToSet = {
            point: {
                lng: coords.lng,
                lat: coords.lat
            },
            draggable: true,
            url: null,
            opacity: 0.5,
            restriction: []
        };
        this.addInfo.modal('show');
    }

    gotUser(r: Response) {
        let userContent = r.json();
        return [true, userContent['session']];
    }

    gotNotLoggedIn(e: Response) {
        console.log('Not logged in: ' + e.ok);
        return [];
    }

    getOauth2(res: Response) {
        let resultToken = res.json();
        this.userInformation.setToken(resultToken['access_token']);
        this.userInformation.setRefreshToken(resultToken['refresh_token']);
        this.userInformation.setExpiresIn(resultToken['expires_in']);
        return [true];
    }

    handleTokenError(err: Response) {
        console.log('ERROR TOKEN');
        console.log(err);
        console.log(err.headers);
        console.log(err.url);
        return [];
    }

    gotData(res: Response) {
        console.log(res);
        let result = res.json();
        return result || [];
    }

    gotError(err: Response) {
        console.log(err.ok);
        return [];
    }
}