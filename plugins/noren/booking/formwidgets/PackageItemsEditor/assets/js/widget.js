$(document).on('click', '[data-add-item]', function () {
    var container = $('[data-control="items-container"]');
    var index = container.find('tr').length;

    var row = `
        <tr>
            <td><input type="number" name="PackageItemsEditor[members_count][${index}]" class="form-control" /></td>
            <td><input type="number" name="PackageItemsEditor[price][${index}]" class="form-control" /></td>
            <td><button type="button" class="btn btn-danger btn-sm" data-remove-item>-</button></td>
        </tr>
    `;
    container.append(row);
});

$(document).on('click', '[data-remove-item]', function () {
    $(this).closest('tr').remove();
});
