export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((result: Record<string, T[]>, currentValue: T) => {
        // Get the value of the key for the current item as string
        let groupKey = String(currentValue[key]);

        // If the group doesn't exist yet, create it
        if (!result[groupKey]) {
            result[groupKey] = [];
        }

        // Add the current item to the group
        result[groupKey].push(currentValue);
        return result;
    }, {} as Record<string, T[]>); // Initial value for the result object
}