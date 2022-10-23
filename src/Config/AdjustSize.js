export var Size = 0;

export function AdjustSize({ setSize }) {
    
    switch (setSize) {
        case 1:
            Size = -5;
            console.log(Size);
            break;
        case 2:
            Size = 0;
            console.log(Size);
            break;
        case 3:
            Size = 5;
            console.log(Size);
            break;
        default:
            Size = 0;
            break;
    }
           
}; 
            