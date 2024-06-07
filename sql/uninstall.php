<?php
/**
 * Copyright 2024-2027 Simply.IN Sp. z o.o.
 *
 * NOTICE OF LICENSE
 *
 * Licensed under the EUPL-1.2 or later.
 * You may not use this work except in compliance with the Licence.
 *
 * Copy of the Licence is available at:
 * https://joinup.ec.europa.eu/software/page/eupl
 * It is bundled with this package in the file LICENSE.txt
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Licence is distributed on an as is basis,
 * without warranties or conditions of any kind, either express or implied.
 * Check the Licence for the specific language governing permissions
 * and limitations under the License.
 *
 * @author   Simply.IN Sp. z o.o.
 * @copyright 2024-2027 Simply.IN Sp. z o.o.
 * @license   https://joinup.ec.europa.eu/software/page/eupl
 */

/*
 * In some cases you should not drop the tables.
 * Maybe the merchant will just try to reset the module
 * but does not want to loose all of the data associated to the module.
 */
if (!defined('_PS_VERSION_')) {
    exit;
}
$sql = [];

foreach ($sql as $query) {
    if (Db::getInstance()->execute($query) == false) {
        return false;
    }
}
