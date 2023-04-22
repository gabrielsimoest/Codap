import { useEffect, useRef } from 'react';
import { initialUpdaterRun } from '../animation';
import { makeMutable, startMapper, stopMapper } from '../core';
import { shouldBeUseWeb } from '../PlatformChecker';
export function useDerivedValue(processor, dependencies) {
    var _a;
    const initRef = useRef(null);
    let inputs = Object.values((_a = processor._closure) !== null && _a !== void 0 ? _a : {});
    if (shouldBeUseWeb()) {
        if (!inputs.length && (dependencies === null || dependencies === void 0 ? void 0 : dependencies.length)) {
            // let web work without a Babel/SWC plugin
            inputs = dependencies;
        }
    }
    // build dependencies
    if (dependencies === undefined) {
        dependencies = [...inputs, processor.__workletHash];
    }
    else {
        dependencies.push(processor.__workletHash);
    }
    if (initRef.current === null) {
        initRef.current = makeMutable(initialUpdaterRun(processor));
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sharedValue = initRef.current;
    useEffect(() => {
        const fun = () => {
            'worklet';
            sharedValue.value = processor();
        };
        const mapperId = startMapper(fun, inputs, [sharedValue]);
        return () => {
            stopMapper(mapperId);
        };
    }, dependencies);
    useEffect(() => {
        return () => {
            initRef.current = null;
        };
    }, []);
    return sharedValue;
}
