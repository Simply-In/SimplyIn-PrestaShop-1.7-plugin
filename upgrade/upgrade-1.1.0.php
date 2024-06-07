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
if (!defined('_PS_VERSION_')) {
    exit;
}

/**
 * This function updates your module from previous versions to the version 1.1,
 * usefull when you modify your database, or register a new hook ...
 * Don't forget to create one file per version.
 */
function upgrade_module_1_1_0($module)
{
    /*
     * Do everything you want right there,
     * You could add a column in one of your module's tables
     */

    return true;
}
