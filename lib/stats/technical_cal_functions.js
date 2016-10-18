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

function _sortDays(days, desc){
    return days.sort(function(a, b){
        if(desc){
            if(a < b) return 1 ;
            else if(a > b) return -1 ;
            else return 0 ;
        } else {
            if(a < b) return -1 ;
            else if(a > b) return 1 ;
            else return 0 ;
        }
    }) ;
}

function _getAttrArr(prefix, arr){
    return arr.map(function(it, idx, array){
        return prefix+it ;
    })
}

function _getAttrMap(prefix, arr){
    var ret = {} ;

    for(var i=0; i < arr.length; i++){
        ret[arr[i]] = prefix+arr[i] ;
    }
    
    return ret ;
}

function updateDMIAll(records, dmi_days){
    records = _sortRecord(records) ;
    dmi_days = _sortDays(dmi_days) ;

    // calculate tr, +dm (p_dm), -dm (n_dm)
    for(var i=1; i < records.length; i++){
        var tmp_arr = [] ;
        var cur_rec = records[i] ;
        var pre_rec = records[i-1] ;

        tmp_arr.push(cur_rec.high - cur_rec.low) ;
        tmp_arr.push(Math.abs(cur_rec.high - pre_rec.close)) ;
        tmp_arr.push(Math.abs(cur_rec.low - pre_rec.close)) ;

        // get max of tmp_arr
        cur_rec.tr = tmp_arr.reduce(function(pre, cur){
            return pre > cur? pre: cur ;
        }, 0) ;

        var p_dm = cur_rec.high - pre_rec.high ;
        var n_dm = pre_rec.low - cur_rec.low ;

        if(p_dm > n_dm && p_dm > 0){
            cur_rec.p_dm = p_dm ;
        } else {
            cur_rec.p_dm = 0 ;
        }

        if(p_dm < n_dm && n_dm > 0){
            cur_rec.n_dm = n_dm ;
        } else {
            cur_rec.n_dm = 0 ;
        }
    }

    var tr_attrs_map = _getAttrMap('tr', dmi_days) ;
    var pdm_attrs_map = _getAttrMap('p_dm', dmi_days) ;
    var ndm_attrs_map = _getAttrMap('n_dm', dmi_days) ;
    var tmp_tr_sum = 0 ;
    var tmp_pdm_sum = 0 ;
    var tmp_ndm_sum = 0 ;
    var tmp_dmi_days = dmi_days.slice(0) ;
    // calculate the first tr, p_dm and n_dm
    for(var i=1; i < records.length; i++){
        var cur_rec = records[i] ;
    
        tmp_tr_sum += cur_rec.tr ;
        tmp_pdm_sum += cur_rec.p_dm ;
        tmp_ndm_sum += cur_rec.n_dm ;

        if(i === tmp_dmi_days[0]){
            cur_rec[tr_attrs_map[i]] = tmp_tr_sum/i ;
            cur_rec[pdm_attrs_map[i]] = tmp_pdm_sum/i ;
            cur_rec[ndm_attrs_map[i]] = tmp_ndm_sum/i ;

            tmp_dmi_days.splice(0, 1) ;

            if(tmp_dmi_days.length === 0) 
                break ;
        }
    }

    var pdi_attrs_map = _getAttrMap('p_di', dmi_days) ;
    var ndi_attrs_map = _getAttrMap('n_di', dmi_days) ;
    // calculate +di (p_di), -di (n_di) and dx
    for(var i=1; i < records.length; i++){
        var cur_rec = records[i] ;
        var pre_rec = records[i-1] ;

        for(var j=0; j<dmi_days.length; j++){
            var dmi_day = dmi_days[j] ;

            if(!cur_rec[tr_attrs_map[dmi_day]] && pre_rec[tr_attrs_map[dmi_day]]){
                cur_rec[tr_attrs_map[dmi_day]] = (dmi_day-1)*pre_rec[tr_attrs_map[dmi_day]]/dmi_day + cur_rec.tr/dmi_day ; 
            }

            if(!cur_rec[pdm_attrs_map[dmi_day]] && pre_rec[pdm_attrs_map[dmi_day]]){
                cur_rec[pdm_attrs_map[dmi_day]] = (dmi_day-1)*pre_rec[pdm_attrs_map[dmi_day]]/dmi_day + cur_rec.p_dm/dmi_day ; 
            }

            if(!cur_rec[ndm_attrs_map[dmi_day]] && pre_rec[ndm_attrs_map[dmi_day]]){
                cur_rec[ndm_attrs_map[dmi_day]] = (dmi_day-1)*pre_rec[ndm_attrs_map[dmi_day]]/dmi_day + cur_rec.n_dm/dmi_day ; 
            }

            cur_rec[pdi_attrs_map[dmi_day]] = 100*cur_rec[pdm_attrs_map[dmi_day]]/cur_rec[tr_attrs_map[dmi_day]] ;
            cur_rec[ndi_attrs_map[dmi_day]] = 100*cur_rec[ndm_attrs_map[dmi_day]]/cur_rec[tr_attrs_map[dmi_day]] ;

            cur_rec.dx = 100*Math.abs(cur_rec[pdi_attrs_map[dmi_day]] - cur_rec[ndi_attrs_map[dmi_day]])/
                (cur_rec[pdi_attrs_map[dmi_day]] + cur_rec[ndi_attrs_map[dmi_day]]) ;
        }
    }

    tmp_dmi_days = dmi_days.slice(0) ;
    var tmp_dx_sum = 0 ;
    var dx_attrs_map = _getAttrMap('dx', dmi_days) ;
    var sum_count = 0 ;
    // calculate the first adx
    for(var i=1; i < records.length; i++){
        var cur_rec = records[i] ;

        if(cur_rec.dx){
            tmp_dx_sum += cur_rec.dx ;
            sum_count++ ;
        }

        if(sum_count === tmp_dmi_days[0]){
            cur_rec[dx_attrs_map[sum_count]] = tmp_dx_sum/sum_count ;

            tmp_dmi_days.splice(0, 1) ;

            if(tmp_dmi_days.length === 0) 
                break ;
        }
    }

    for(var i=1; i < records.length; i++){
        var cur_rec = records[i] ;
        var pre_rec = records[i-1] ;

        for(var j=0; j<dmi_days.length; j++){
            var dmi_day = dmi_days[j] ;

            if(!cur_rec[dx_attrs_map[dmi_day]] && pre_rec[dx_attrs_map[dmi_day]]){
                cur_rec[dx_attrs_map[dmi_day]] = (dmi_day-1)*pre_rec[dx_attrs_map[dmi_day]]/dmi_day + cur_rec.dx/dmi_day ; 
            }
        }
    }
}

/**
 * this is based on http://nengfang.blogspot.tw/2014/09/macd-excel.html
 * 
 */
function updateMACDAll(records, macd_paras){
    records = _sortRecord(records) ;
    
    if(macd_paras.length !== 3) return ;

    var ema_days = [macd_paras[0], macd_paras[1]] ;
    var diff_day = macd_paras[2] ;
    var ema_attrs = _getAttrArr('ema', ema_days) ;
    var macd_attr = 'macd'+'_'+macd_paras[0]+'_'+macd_paras[1]+'_'+macd_paras[2] ;
    var diff_attr = 'macd_diff'+diff_day ;

    // calculate DI
    for(var i=0; i < records.length; i++){
        records[i].di = ((records[i].high + records[i].low) + records[i].close*2)/4 ;
    }

    var tmp_ema_days = ema_days.slice(0) ;
    var tmp_di_sum = 0 ;
    // calculate first EMA12, EMA26
    for(var i=0; i < records.length; i++){
        var idx = i+1;
        
        tmp_di_sum += records[i].di ;

        if(idx === tmp_ema_days[0]){
            records[i]['ema'+tmp_ema_days[0]] = tmp_di_sum/tmp_ema_days[0];

            tmp_ema_days.splice(0, 1) ;

            if(tmp_ema_days.length === 0)
                break ;
        }
    }

    // calculate EMA12, EMA26, DIFF
    tmp_ema_days = ema_days.slice(0) ;
    for(var i=1; i < records.length; i++){
        var cur_rec = records[i] ;
        var pre_rec = records[i-1] ;

        for(var j=0; j< tmp_ema_days.length; j++){
            var ema_day = tmp_ema_days[j] ;
            var ema_attr = ema_attrs[j] ;

            if(!cur_rec[ema_attr] && pre_rec[ema_attr]){
                cur_rec[ema_attr] = (pre_rec[ema_attr]*(ema_day-1) + cur_rec.di*2)/(ema_day+1) ;
            }
        }

        if(cur_rec[ema_attrs[0]] && cur_rec[ema_attrs[1]]){
            cur_rec[diff_attr] = cur_rec[ema_attrs[0]] - cur_rec[ema_attrs[1]] ; 
        }
    }

    // calculate first macd
    var diff_arr = [] ;
    for(var i=0; i < records.length; i++){
        if(records[i][diff_attr]){
            diff_arr.push(records[i][diff_attr]) ;
        }

        if(diff_arr.length === diff_day){
            records[i][macd_attr] = diff_arr.reduce(function(pre, cur){
                return pre+cur ;
            }, 0)

            break ;
        }
    }

    // calculate macd
    for(var i=1; i < records.length; i++){
        var cur_rec = records[i] ;
        var pre_rec = records[i-1] ;

        if(!cur_rec[macd_attr] && pre_rec[macd_attr]){
            cur_rec[macd_attr] = (pre_rec[macd_attr]*(diff_day-1)+cur_rec[diff_attr]*2)/(diff_day+1) ;
        }
    }
}

function updatePsyAll(records, psy_days){
    records = _sortRecord(records, true) ;
    psy_days = _sortDays(psy_days) ;

    for(var i=0; i < records.length; i++){
        var cur_rec = records[i] ;
        var up_arr = [] ;
        var tmp_psy_days = psy_days.slice(0) ;

        for(var j=i; j < records.length; j++){
            if((j+1) === records.length) 
                break ;  // the last record

            if((records[j].close - records[j+1].close) > 0)
                up_arr.push(1) ;
            else
                up_arr.push(0) ;

            if(up_arr.length === tmp_psy_days[0]){
                cur_rec['psy'+tmp_psy_days[0]] = 100*up_arr.reduce(function(pre, cur){
                    return pre+cur ;
                }, 0)/tmp_psy_days[0] ;

                tmp_psy_days.splice(0, 1) ;

                if(tmp_psy_days.length === 0) 
                    break; 
            }
        }
    }
}

function updateBiasAll(records, bias_days){
    records = _sortRecord(records) ;
    bias_days = _sortDays(bias_days) ;

    var ma_attrs = _getAttrArr('ma', bias_days) ;
    var bias_attrs = _getAttrArr('bias', bias_days) ;

    for(var i=0; i < records.length; i++){
        var cur_rec = records[i] ;

        for(var j=0; j < bias_days.length; j++){
            var ma = cur_rec[ma_attrs[j]] ;
            if(ma){
                cur_rec[bias_attrs[j]] = 100*(cur_rec.close-ma)/ma;
            }
        }
    }
}

/**
 * this is based on 
 * http://www.moneydj.com/KMDJ/Wiki/wikiViewer.aspx?keyid=1342fb37-760e-48b0-9f27-65674f6344c9
 */
function updateRSIAll(records, rsi_days){
    records = _sortRecord(records) ;
    rsi_days = _sortDays(rsi_days) ;

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
    mv_days = _sortDays(mv_days) ;

    for(var i=0; i < records.length; i++){
        var cur_rec = records[i] ;
        var tmp_mv_days = mv_days.slice(0) ;
        var tmp_sum = 0 ;

        for(var j=i; j < records.length; j++){
            var idx = j-i+1 ;
            tmp_sum += records[j].close ;

            if(idx === tmp_mv_days[0]){
                cur_rec['ma'+idx] = tmp_sum/idx ;
                tmp_mv_days.splice(0, 1) ;

                if(tmp_mv_days.length <= 0)
                    break ; 
            }
        }
    }
}

function updateKDAll(records, kd_days){
    records = _sortRecord(records) ;
    kd_days = _sortDays(kd_days) ;

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
exports.updateBiasAll = updateBiasAll ;
exports.updatePsyAll = updatePsyAll ;
exports.updateMACDAll = updateMACDAll ;
exports.updateDMIAll = updateDMIAll ;