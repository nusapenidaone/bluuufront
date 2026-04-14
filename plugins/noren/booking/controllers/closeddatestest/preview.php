<?php Block::put('breadcrumb') ?>
    <ul>
        <li><a href="<?= Backend::url('noren/booking/closeddatestest') ?>">CloseddatesTest</a></li>
        <li><?= e($this->pageTitle) ?></li>
    </ul>
<?php Block::endPut() ?>

<?= $this->formRender(['preview' => true]) ?>
