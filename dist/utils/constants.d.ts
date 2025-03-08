export declare const UserLoginType: {
    readonly GOOGLE: "GOOGLE";
    readonly GITHUB: "GITHUB";
    readonly EMAIL_PASSWORD: "EMAIL_PASSWORD";
};
export type UserLoginTypeValues = (typeof UserLoginType)[keyof typeof UserLoginType];
export declare const AvailableSocialLogins: ("GOOGLE" | "GITHUB" | "EMAIL_PASSWORD")[];
export declare const USER_TEMPORARY_TOKEN_EXPIRY: number;
