const tables = {

    cad_users: {
        schema: 'cad_users',
        columns: {
            id: 'id',
            name: 'name',
            role: 'role',
        },
    },
    cad_role: {
        schema: 'cad_role',
        columns: {
            id: 'id',
            describle: 'describle',
            enabled: 'enabled',
        },
    },
    cad_localization: {
        schema: 'cad_localization',
        columns: {
            id: 'id',
            address: 'address',
        },
    },
    cad_client: {
        schema: 'cad_client',
        columns: {
            id: 'id',
            phone: 'phone',
            name: 'name',
            email: 'email',
            account_code: 'account_code',
        },
    },
    cad_monitoring: {
        schema: 'cad_monitoring',
        columns: {
            id: 'id',
            value_monitoring: 'value_monitoring',
            contract_id: 'contract_id',
        },
    },
    cad_peca: {
        schema: 'cad_peca',
        columns: {
            id: 'id',
            describe: 'describe',
            value: 'value',
        },
    },
    cad_mo: {
        schema: 'cad_mo',
        columns: {
            id: 'id',
            value: 'value',
        },
    },
    cad_desloc: {
        schema: 'cad_desloc',
        columns: {
            id: 'id',
            value: 'value',
        },
    },
    cad_contract: {
        schema: 'cad_contract',
        columns: {
            id: 'id',
            user_id: 'user_id',
            client_id: 'client_id',
            locallization_id: 'locallization_id',
            number_id: 'number_id',
            monitoring_id: 'monitoring_id',
            equipament: 'equipament',
            mo: 'mo',
            desloc: 'desloc',
            all_values: 'all_values',
            date: 'date'
        },
    },
    cad_number: {
        schema: 'cad_number',
        columns: {
            id: 'id',
            number: 'number',
        },
    }
};

export default tables;