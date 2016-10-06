/**
 * can not be sure the records are in order.
 * 
 * this is used to make sure the records are in the right order before the calculation.
 */
function _sortRecord(records, desc){
    return records.sort(function(a, b){
        if(desc){
            if(a.date.getTime() < b.date.getTime()) return 1 ;
            else if(a.date.getTime() > b.date.getTime()) return -1 ;
            else return 0 ;
        } else {
            if(a.date.getTime() < b.date.getTime()) return -1 ;
            else if(a.date.getTime() > b.date.getTime()) return 1 ;
            else return 0 ;
        }
    }) ;
}

/**
 * this is based on 
 * http://www.moneydj.com/KMDJ/Wiki/wikiViewer.aspx?keyid=1342fb37-760e-48b0-9f27-65674f6344c9
 */
function updateRSIAll(records, rsi_days){
    records = _sortRecord(records) ;

    var tmp_attr_map = {} ;
    for(var i=0; i < rsi_days.length; i++){
        tmp_attr_map[rsi_days[i]] = ['up'+rsi_days[i], 'dn'+rsi_days[i]] ;
    }

    var tmp_up = 0;
    var tmp_down = 0;

    // reset up and dn
    for(var i=0; i < records.length; i++){
        for(var j=0; j < rsi_days.length; j++){
            var attr_list = tmp_attr_map[rsi_days[j]] ;

            records[i][attr_list[0]] = null ;
            records[i][attr_list[1]] = null ;   
        }
    }

    // init the first up and dn
    var tmp_rsi_days = rsi_days.slice(0) ;
    for(var i=1; i < records.length; i++){
        var idx = i+1 ;
        var diff = -1*(records[i].close - records[i-1].close) ;

        if(diff > 0)
            tmp_up += diff ;
        else if(diff < 0)
            tmp_down += diff ;

        if(idx === tmp_rsi_days[0]){
            records[i]['up'+idx] = tmp_up/idx ;
            records[i]['dn'+idx] = Math.abs(tmp_down/idx) ;

            tmp_rsi_days.splice(0, 1) ;

            if(tmp_rsi_days.length === 0) 
                break ;
        }
    }

    // calculate up, dn and rsi
    for(var i=0; i < records.length; i++){
        for(var j=0; j < rsi_days.length; j++){
            var attr_list = tmp_attr_map[rsi_days[j]] ;

            if(i !== 0 && (!records[i][attr_list[0]] && !records[i][attr_list[1]])){
                if(records[i-1][attr_list[0]] && records[i-1][attr_list[1]]){
                    var diff = records[i].close - records[i-1].close ;

                    if(diff > 0){
                        tmp_up = diff ;
                        tmp_down = 0 ;
                    }
                    else if(diff < 0){
                        tmp_down = Math.abs(diff) ;
                        tmp_up = 0 ;
                    }

                    var new_up = (tmp_up-records[i-1][attr_list[0]])/rsi_days[j] + records[i-1][attr_list[0]] ;
                    var new_dn = (tmp_down-records[i-1][attr_list[1]])/rsi_days[j] + records[i-1][attr_list[1]] ;
                    records[i][attr_list[0]] = new_up ;
                    records[i][attr_list[1]] = new_dn ;
                    records[i]['rsi'+rsi_days[j]] = 100*new_up/(new_up+new_dn) ;
                }
            }
        }
    }
}

function updateMvAll(records, mv_days){
    records = _sortRecord(records, true) ;

    for(var i=0; i < records.length; i++){
        var cur_rec = records[i] ;
        var tmp_mv_days = mv_days.slice(0) ;
        var tmp_sum = 0 ;

        for(var j=i; j < records.length; j++){
            var idx = j-i+1 ;
            tmp_sum += records[j].close ;

            if(idx === tmp_mv_days[0]){
                cur_rec['mv'+idx] = tmp_sum/idx ;
                tmp_mv_days.splice(0, 1) ;

                if(tmp_mv_days.length <= 0)
                    break ; 
            }
        }
    }
}

function updateKDAll(records, kd_days){
    records = _sortRecord(records) ;

    for(var i=0 ; i<kd_days; i++){
        var kd_day = kd_days[i] ;

        if(records.length < kd_day) {
            return ;
        }
        
        var k_str = 'k' + kd_day ;
        var d_str = 'd' + kd_day ;
        // KD9, there needs to be at least 9 records to calculate the KD.
        for(var i=(kd_day-1); i < records.length; i++){
            var cur_rec = records[i] ;
            var cal_rec_count = 0 ;
            var period_max = 0 ;
            var period_min = Number.MAX_SAFE_INTEGER ;

            for(var j=(i-kd_day+1); j <= i; j++){
                if(records[j].high > period_max)
                    period_max = records[j].high ;
                
                if(records[j].low < period_min)
                    period_min = records[j].low ;
            }

            var rsv = 100*((cur_rec.close - period_min)/(period_max - period_min)) ;
            var pre_k = records[i-1][k_str]? records[i-1][k_str]: 50 ;
            var pre_d = records[i-1][d_str]? records[i-1][d_str]: 50 ;
            var cur_k = (rsv/3 + 2*pre_k/3) ;

            cur_rec[k_str] = cur_k ;
            cur_rec[d_str] = (cur_k/3 + 2*pre_d/3) ;
        }
    }
}

exports.updateMvAll = updateMvAll ;
exports.updateKDAll = updateKDAll ;
exports.updateRSIAll = updateRSIAll ;