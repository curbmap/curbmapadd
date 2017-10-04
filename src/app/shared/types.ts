export interface Restriction {
    id?: string;
    type: string;
    startTime: number;
    endTime: number;
    days: Array<boolean>;
    angle: number;  // 0, 45, 90 degrees rotation from parallel
    voted: number; // -1 = down voted, 1 = up voted, 0 = not voted
    modified: number; // 0 = not modified, 1 = modified, -1 = new
    updated: number;
    timeLimit?: number;
    cost?: number;
    per?: number;
    color?: string;
    upVotes?: number;
    downVotes?: number;
}

export interface Line {
    id?: string;
    line: Point[];
    restr: Restriction[];
    color: string;
    opacity: number;
}

export interface Point {
    lat: number;
    lng: number;
}

export interface Marker {
    id?: string;
    lineId?: number;
    point: Point;
    label?: string;
    draggable: boolean;
    url: string;
    opacity: number;
    restriction: Restriction[];
    info?: string;
}