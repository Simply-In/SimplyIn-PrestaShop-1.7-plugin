#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if Composer is installed
if ! command -v composer &> /dev/null
then
    echo "Composer could not be found. Please install Composer to proceed."
    exit
fi



# Install PHP CS Fixer locally
composer require --dev friendsofphp/php-cs-fixer:^3.58

# Create PHP CS Fixer configuration file
cat > .php-cs-fixer.dist.php <<EOL
<?php

\$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__)
    ->exclude('vendor');

return (new PhpCsFixer\Config())
    ->setRiskyAllowed(true)
    ->setRules([
        '@PSR2' => true,
        'array_syntax' => ['syntax' => 'short'],
        'binary_operator_spaces' => [
            'default' => 'single_space',
            'operators' => ['=>' => null],
        ],
        'blank_line_after_opening_tag' => true,
        'blank_line_before_statement' => [
            'statements' => ['return'],
        ],
        'braces' => [
            'allow_single_line_closure' => true,
        ],
        'cast_spaces' => ['space' => 'single'],
        'class_attributes_separation' => [
            'elements' => [
                'const' => 'one',
                'method' => 'one',
                'property' => 'one',
                'trait_import' => 'none',
                'case' => 'none',
            ]
        ],
        'concat_space' => ['spacing' => 'one'],
        'declare_equal_normalize' => true,
        'function_declaration' => ['closure_function_spacing' => 'none'],
        'function_typehint_space' => true,
        'include' => true,
        'indentation_type' => true,
        'line_ending' => true,
        'lowercase_cast' => true,
        'method_argument_space' => [
            'on_multiline' => 'ensure_fully_multiline',
        ],
        'no_blank_lines_after_phpdoc' => true,
        'no_extra_blank_lines' => [
            'tokens' => [
                'curly_brace_block',
                'extra',
                'parenthesis_brace_block',
                'square_brace_block',
                'throw',
                'use',
            ],
        ],
        'no_spaces_around_offset' => true,
        'no_unneeded_control_parentheses' => true,
        'no_unused_imports' => true,
        'no_useless_concat_operator' => true,
        'no_whitespace_before_comma_in_array' => true,
        'no_whitespace_in_blank_line' => true,
        'normalize_index_brace' => true,
        'operator_linebreak' => true,
        'ordered_imports' => true,
        'php_unit_construct' => true,
        'php_unit_strict' => false,
        'phpdoc_to_comment' => true,
        'single_line_comment_spacing' => true,
        'single_quote' => true,
        'standardize_not_equals' => true,
        'ternary_operator_spaces' => true,
        'trailing_comma_in_multiline' => true,
        'trim_array_spaces' => true,
        'unary_operator_spaces' => true,
        'whitespace_after_comma_in_array' => true,
        'align_multiline_comment' => true,
    ])
    ->setFinder(\$finder);
EOL

# Run PHP CS Fixer with --allow-risky option
vendor/bin/php-cs-fixer fix --allow-risky=yes

echo "PHP CS Fixer has been applied to your project."