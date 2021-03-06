import { Fork } from "../types";
export default function (fork: Fork): {
    geq: (than: any) => import("./types").Type<{}>;
    defaults: {
        "null": () => null;
        "emptyArray": () => never[];
        "false": () => boolean;
        "true": () => boolean;
        "undefined": () => void;
        "use strict": () => string;
    };
    isPrimitive: import("./types").Type<{}>;
};
