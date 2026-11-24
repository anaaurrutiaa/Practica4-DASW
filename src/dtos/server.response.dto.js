



class ServerResponseDto {
    constructor(status, msg, data, error = null){
        this.status = status;
        this.msg = msg;
        this.data = data;
        this.error = error;
    }
}

export default ServerResponseDto;