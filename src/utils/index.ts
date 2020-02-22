export function addDoubleQuotesForValue(value:string){
    return "\"" + value + "\"";
}
export function buildUpdateQuery(table:string, columns: string[], values: string[], conditions: string){
    // assert columns.length == values.length
    let result = "update " + table + " set ";
    columns.forEach((col,index,arr)=>{
        arr[index] = col + "=" + addDoubleQuotesForValue(values[index]);
    });
    result+=columns.join(',');
    result+=" ";
    result+=conditions;
    return result;
}
export function buildSelectQuery(table:string, columns: string[],conditions: string):string{
    let result = "select "
    if(columns.length == 0){
        result+="*";
    }else{
        result += columns.join(",");
    }
    result+=" from ";
    result+=table;
    result+=" ";
    result+= conditions;
    return result;
}
export function buildInsertQuery(table:string, columns: string[] ,values: string[]){
    let result = "insert into " + table + " (";
    for(let i = 0;i < columns.length-1;i++){
        result+=columns[i]
        result+=","
    }
    result+=columns[columns.length-1];
    result+=") ";
    result+="values ("
    for(let i=0; i < columns.length-1;i++){
        result+="\"";
        result+=values[i];
        result+="\"";
        result+=","
    }
    result+="\"";
    result+=values[columns.length-1];
    result+="\"";
    result+=")";
    return result;
}