import { useEffect } from 'react';
import { startMapper, stopMapper } from '../core';
import { useSharedValue } from './useSharedValue';
import { shouldBeUseWeb } from '../PlatformChecker';
/**
 * @param prepare - worklet used for data preparation for the second parameter
 * @param react - worklet which takes data prepared by the one in the first parameter and performs certain actions
 * the first worklet defines the inputs, in other words on which shared values change will it be called.
 * the second one can modify any shared values but those which are mentioned in the first worklet. Beware of that, because this may result in endless loop and high cpu usage.
 */
export function useAnimatedReaction(prepare, react, dependencies) {
    var _a, _b, _c;
    const previous = useSharedValue(null);
    let inputs = Object.values((_a = prepare._closure) !== null && _a !== void 0 ? _a : {});
    if (shouldBeUseWeb()) {
        if (!inputs.length && (dependencies === null || dependencies === void 0 ? void 0 : dependencies.length)) {
            // let web work without a Babel/SWC plugin
            inputs = dependencies;
        }
    }
    if (dependencies === undefined) {
        dependencies = [
            Object.values((_b = prepare._closure) !== null && _b !== void 0 ? _b : {}),
            Object.values((_c = react._closure) !== null && _c !== void 0 ? _c : {}),
            prepare.__workletHash,
            react.__workletHash,
        ];
    }
    else {
        dependencies.push(prepare.__workletHash, react.__workletHash);
    }
    useEffect(() => {
        const fun = () => {
            'worklet';
            const input = prepare();
            react(input, previous.value);
            previous.value = input;
        };
        const mapperId = startMapper(fun, inputs, []);
        return () => {
            stopMapper(mapperId);
        };
    }, dependencies);
}
