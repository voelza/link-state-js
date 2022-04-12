export function getValue(obj: any, path: string | undefined): any {
    if (!path || !obj) {
        return obj;
    }

    const dotIndex = path.indexOf(".");
    if (dotIndex !== -1) {
        const subPath: string = path.substring(dotIndex + 1);
        const subPathDotIndex = subPath.indexOf(".");
        if (subPathDotIndex !== -1) {
            return getValue(obj[subPath.substring(0, subPathDotIndex)], subPath);
        }
        return obj[subPath];
    }
    return obj;
}

export function setValue(obj: any, value: any, path: string | undefined): void {
    if (!path) {
        obj = value;
        return;
    }

    const dotIndex = path.indexOf(".");
    if (dotIndex !== -1) {
        const subPath: string = path.substring(dotIndex + 1);
        const subPathDotIndex = subPath.indexOf(".");
        if (subPathDotIndex !== -1) {
            return getValue(obj[subPath.substring(0, subPathDotIndex)], subPath);
        }
        return obj[subPath];
    }
}

export function getObjName(path: string) {
    const dotIndex = path.indexOf(".");
    if (dotIndex !== -1) {
        return path.substring(0, dotIndex);
    }

    const bracketIndex = path.indexOf("(");
    if (bracketIndex !== -1) {
        return path.substring(0, bracketIndex);
    }
    return path;
}