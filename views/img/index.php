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
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');

header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

header('Location: ../');
exit;
