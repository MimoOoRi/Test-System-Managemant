import moment from "moment";

export const getTestSchedule = info => {
    if (info.durations != undefined) {
        let minutes = info.durations.slice(0, -2)
        let startTime = info.startTime
        if (!info.startTime) {
            startTime = info['start-time']
        }
        let day = startTime.split('/').concat(info.date)
        day[1]--;
        let start = moment(day).format("YYYY-MM-DD HH:mm")
        let end = moment(day).add(minutes, 'm').format("YYYY-MM-DD HH:mm")
        return `${start} - ${end}`
    }
}

const getAjaxAns = (url, type, data) => {
    // console.log(url, type, data);
    let ansJSON = JSON.stringify(data)
    return $.ajax({
        url,
        type,
        data: {
            info: ansJSON
        }
    })
}

export const getAjax = (url, type) => {
    return $.ajax({
        url,
        type
    })
}

// export {getTestSchedule}