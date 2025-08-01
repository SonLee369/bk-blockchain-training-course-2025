/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/todo_app.json`.
 */
export type TodoApp = {
  "address": "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  "metadata": {
    "name": "todoApp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addTodo",
      "discriminator": [
        188,
        16,
        45,
        145,
        4,
        5,
        188,
        75
      ],
      "accounts": [
        {
          "name": "userProfile",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "userProfile"
          ]
        }
      ],
      "args": [
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeUser",
      "discriminator": [
        111,
        17,
        185,
        250,
        60,
        122,
        38,
        254
      ],
      "accounts": [
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "toggleTodo",
      "discriminator": [
        83,
        78,
        30,
        70,
        121,
        65,
        188,
        47
      ],
      "accounts": [
        {
          "name": "userProfile",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "userProfile"
          ]
        }
      ],
      "args": [
        {
          "name": "todoIdx",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    }
  ],
  "types": [
    {
      "name": "todoItem",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "completed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "lastTodo",
            "type": "u8"
          },
          {
            "name": "todoCount",
            "type": "u8"
          },
          {
            "name": "todos",
            "type": {
              "vec": {
                "defined": {
                  "name": "todoItem"
                }
              }
            }
          }
        ]
      }
    }
  ]
};
