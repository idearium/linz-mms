var linz = require('../../'),
	forms = require('forms'),
	fields = forms.fields,
	widgets = forms.widgets,
	validators = forms.validators,
	async = require('async');

var padWithZero = function (val) {
	return String(val).length < 2 ? '0' + String(val) : val;
};

var generateFormFromModel = exports.generateFormFromModel = function (m, r, formType, cb) {

	var formFields = {};

    // defaults to 'create'
    formType = formType || 'create';

    async.eachSeries(Object.keys(m.form), function (fieldName, fn) {

        var field = m.form[fieldName];
        var fieldOptions = field.options;
        var formField;
        var choices = {};
        var defaultValue = null;

        // determine if the field has enumValues
        if (Array.isArray(field.list) && field.list.length) {

            // add the options to the choices object to be passed to the select box
            if (field.type !== 'array') field.type = 'enum';

            // list can contain an aray of strings or objects
            field.list.forEach(function (val) {
                if(typeof val === 'object') choices[val.value] = val.name;
                else choices[val] = val;
            });

        }

        if (field.default !== undefined && field.type !== 'array') {

            // work out the default value and use it
            if (typeof field.default !== 'function') {
                defaultValue = field.default;
            } else if (typeof field.default === 'function') {
                defaultValue = field.default();
            }

        } else if (field.default === undefined && field.type === 'datetime') {

            field.default = function () {

                var d = new Date();
                return d.getFullYear() + '-' +
                        padWithZero(d.getMonth()+1) + '-' +
                        padWithZero(d.getDate()) + 'T' +
                        padWithZero(d.getHours()) + ':' +
                        padWithZero(d.getMinutes()) + ':' +
                        '00.000';
            };

            defaultValue = field.default();

        }

        async.series([
            // TODO: need to refactor this!!
            // function (callback) {

            //     // if the field has a reference, we need to grab the values for that type and add them in
            //     if (field.options.ref) {

            //         mongoose.models[field.options.ref].find({}, function (err, docs) {

            //             field.type = 'enum';
            //             choices = {};

            //             docs.forEach(function (doc) {
            //                 choices[doc._id.toString()] = doc.title || doc.label || doc.name || doc.toString();
            //             });

            //             callback(null);

            //         });

            //     } else {

            //         callback(null);

            //     }

            // },
            function (callback) {

                if (field.visible === false || (formType === 'create' && !field.create.visible) || (formType === 'edit' && !field.edit.visible) )
                    return callback(null);


                switch (field.type) {

                    case 'enum':
                    formField = fields.string({
                                    widget: widgets.select({
                                        classes: ['form-control'],
                                        disabled: field.disabled  //TODO: not working, required hacking caolan form
                                    }),
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    },
                                    // need to use toString so that forms module matching (===) works, was erroring on numbers
                                    value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
                                    choices: choices
                                });
                    break;

                    case 'string':
                    formField = fields.string({
                                    widget: widgets.text({
                                        classes: ['form-control'],
                                        placeholder: field.placeholder,
                                        disabled: field.disabled
                                    }),
                                    value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    }
                                });
                    break;

                    case 'date':
                    formField = fields.date({
                                    widget: widgets.date({
                                        classes: ['form-control'],
                                        disabled: field.disabled
                                    }),
                                    value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || defaultValue,
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    }
                                });
                    break;

                    case 'datetime':
                    formField = fields.date({
                                    widget: widgets.datetimeLocal({
                                        classes: ['form-control'],
                                        disabled: field.disabled
                                    }),
                                    value: (r[fieldName] !== undefined ? r[fieldName].toISOString().slice(0,23) : defaultValue) || defaultValue,
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    }
                                });
                    break;

                    case 'text':
                    formField = fields.string({
                                    widget: widgets.textarea({
                                        classes: ['form-control'],
                                        placeholder: field.placeholder,
                                        disabled: field.disabled,
                                        rows: '6'
                                    }),
                                    value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    }
                                });
                    break;

                    case 'number':
                    formField = fields.number({
                                    widget: widgets.text({
                                        classes: ['form-control'],
                                        disabled: field.disabled
                                    }),
                                    // need to use toString() so that 0 doesn't eval to falsy
                                    value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    }
                                });
                    break;

                    case 'oid':
                    formField = fields.string({
                                    widget: widgets.text({
                                        classes: ['form-control'],
                                        disabled: field.disabled
                                    }),
                                    value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    }
                                });
                    break;

                    case 'boolean':
                    formField = fields.boolean({
                                    widget: widgets.checkbox({
                                        disabled: field.disabled //TODO: not working, required hacking caolan form
                                    }),
                                    value: defaultValue,
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    }
                                });
                    break;

                    case 'array':
                    formField = fields.array({
                                    widget: widgets.multipleCheckbox({
                                        classes: ['form-control'],
                                        disabled: field.disabled //TODO: not working, required hacking caolan form
                                    }),
                                    value: r[fieldName],
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    },
                                    choices: choices
                                });
                    break;

                    case 'password':
                    formField = fields.password({
                                    widget: widgets.password({
                                        classes: ['form-control'],
                                        placeholder: field.placeholder,
                                        disabled: field.disabled
                                    }),
                                    value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    }
                                });

                    break;

                    case 'email':
                    formField = fields.email({
                                    widget: widgets.email({
                                        classes: ['form-control'],
                                        placeholder: field.placeholder,
                                        disabled: field.disabled
                                    }),
                                    value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    }
                                });
                    break;

                    default:
                    formField = fields.string({
                                    widget: widgets.text({
                                        classes: ['form-control'],
                                        placeholder: field.placeholder,
                                        disabled: field.disabled
                                    }),
                                    value: (r[fieldName] !== undefined ? r[fieldName].toString() : null) || (defaultValue !== null ? defaultValue.toString() : defaultValue),
                                    cssClasses: {
                                        label: ['col-lg-2 control-label']
                                    }
                                });
                    break;

                }

                // configure field label
                if (field.create.label && formType === 'create') {
                    formField.label = field.create.label
                }
                else if (field.edit.label && formType === 'edit') {
                    formField.label = field.edit.label;
                }
                else {
                    formField.label = field.label;
                }

                formField.helpText = field.helpText;

                // add the field to the list of fields
                formFields[fieldName] = formField;

                callback(null);

            }
        ], function (err, results) {

            fn(null);

        });


    }, function (err) {

        cb(forms.create(formFields));

    });

};

var bootstrapField = exports.bootstrapField = function (name, object) {

	var widget;
	var label = object.labelHTML(name);
	var error = object.error ? '<p class="form-error-tooltip">' + object.error + '</p>' : '' ;
    var helpText = object.helpText ? '<span class="help-block">' + object.helpText + '</span>' : '';

	if (object.widget.type === 'checkbox') {
		widget = '<div class="col-lg-10"><div class="checkbox">' + object.widget.toHTML(name, object) + '</div>' + helpText + error + '</div>';
	}
    else if (object.widget.type === 'multipleCheckbox'){

        widget = '<div class="col-lg-10">';

        if(Object.keys(object.choices).length){
            for(var key in object.choices){
                widget += '<div class="checkbox"><label>'
                + '<input type="checkbox" name="' + name + '" id="id_' + name + '_' + key + '" value="' + object.choices[key] + '" />'
                + key + '</label></div>';
            }
        }

        widget += helpText + error + '</div>';

    }
    else {
		widget = '<div class="col-lg-10">' + object.widget.toHTML(name, object) + helpText + error + '</div>';
	}

	return '<div class="form-group ' + (error !== '' ? 'has-error':'') + '">' + label + widget + '</div>';

};