function (doc) {
    // !code util/mvp.js
    if(isChildVisitForm(doc)) {
        var indicators = get_indicators(doc);

        if (indicators.child_dob && indicators.child_dob.value) {
            var meta = doc.form.meta,
                indicator_entries = {},
                age_in_years = get_age_from_dob(indicators.child_dob.value, meta.timeEnd),
                visit_date = new Date(meta.timeEnd),
                case_id = get_case_id(doc);

            var age_in_months = age_in_years*12;

            if (age_in_months > 6 && age_in_months < 60 && indicators.muac.value) {
                // MUAC reading taken during visit
                indicator_entries["muac_reading"] = 1;
                try {
                    var muac_value = parseFloat(indicators.muac.value);
                    if (muac_value < 125.0) {
                        indicator_entries["muac_wasting"] = 1;
                    }
                } catch (err) {
                    log("MUAC value could not be obtained");
                }

                if (doc.form.prev_last_muac) {
                    var prev_last_muac = new Date(doc.form.prev_last_muac),
                        ninety_days_ms = 90*MS_IN_DAY;
                    if (prev_last_muac < visit_date) {
                        var difference = visit_date.getTime() - prev_last_muac.getTime();
                        if (difference <= ninety_days_ms){
                            indicator_entries["routine_muac"] = case_id;
                        }
                    }
                }
            }
            emit_special(doc, visit_date, indicator_entries, [doc._id]);
        }

    }
}